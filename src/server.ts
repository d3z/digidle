import express, {type Request, type Response} from 'express';
import { Game } from './game.ts';

const kv = await Deno.openKv();

const app = express();
app.use(express.json());

let nextGameId = 0;

const MIN_ANSWER = 1000;
const MAX_ANSWER = 2026;

app.post('/games', async (_: Request, res: Response) => {
    const randomAnswer = Math.floor(Math.random() * (MAX_ANSWER - MIN_ANSWER + 1)) + MIN_ANSWER;
    const game = new Game(randomAnswer);
    await kv.set(['games', nextGameId], game);
    res.json({id: nextGameId++});
});

app.get('/games', async (_: Request, res: Response) => {
    const gamesData = [];
    const entries = kv.list<Game>({ prefix: ['games'] });
    for await (const entry of entries) {
        const game = entry.value;
        gamesData.push({
            id: entry.key[1],
            remainingGuesses: game.remainingGuesses,
            finished: game.finished,
            solved: game.solved,
            answer: game.answer,
        });
    }
    res.json(gamesData);
});

app.delete('/games/:id', async (req: Request, res: Response) => {
    const {id} = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({error: 'Invalid game id'});
        return;
    }
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
        res.status(400).json({error: 'Invalid game id'});
        return;
    }
    const entry = await kv.get(['games', gameId]);
    if (!entry.value) {
        res.status(404).json({error: 'Game not found'});
        return;
    }
    await kv.delete(['games', gameId]);
    res.json({message: `Game ${gameId} deleted`});
});

app.put('/games/:id/:guess', async (req: Request, res: Response) => {
    // We do some validation on the guess before passing it to
    // the game instance for checking
    const {id, guess} = req.params;
    if (typeof id !== 'string') {
        res.status(400).json({error: 'Invalid game id'});
        return;
    }
    if (typeof guess !== 'string') {
        res.status(400).json({error: 'Invalid guess. Must be a number.'});
        return;
    }
    const gameId = parseInt(id);
    if (isNaN(gameId)) {
        res.status(400).json({error: 'Invalid game id'});
        return;
    }
    const game = (await kv.get<Game>(['games', gameId])).value;

    if (!game) {
        res.status(404).json({error: 'Game not found'});
        return;
    }

    if (game.finished) {
        res.status(400).json({error: 'Game already finished'});
        return;
    }

    const guessNumber = parseInt(guess);
    const result = game.makeGuess(guessNumber);

    game.solved = result.type === 'solved';
    kv.set(['games', gameId], game);
    res.json(result);
});

app.listen(3000, () => {
    console.log('Digidle server running on localhost:3000');
});
