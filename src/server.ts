import express, {type Request, type Response} from 'express';
import { Game } from './game.ts';

const app = express();
app.use(express.json());

const games: Map<number, Game> = new Map<number, Game>();
let nextGameId = 0;

const MIN_ANSWER = 1000;
const MAX_ANSWER = 2026;

app.post('/games', (_: Request, res: Response) => {
    const randomAnswer = Math.floor(Math.random() * (MAX_ANSWER - MIN_ANSWER + 1)) + MIN_ANSWER;
    const game = new Game(randomAnswer);
    games.set(nextGameId, game);
    res.json({id: nextGameId++});
});

app.get('/games', (_: Request, res: Response) => {
    const gamesData = [];
    for (const [id, game] of games) {
        const gameResult = {
            id,
            remainingGuesses: game.remainingGuesses,
            finished: game.finished,
            solved: game.solved,
            answer: game.answer,
        };
        gamesData.push(gameResult);
    }
    res.json(gamesData);
});

app.delete('/games/:id', (req: Request, res: Response) => {
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
    if (!games.has(gameId)) {
        res.status(404).json({error: 'Game not found'});
        return;
    }
    games.delete(gameId);
    res.json({message: `Game ${gameId} deleted`});
});

app.put('/games/:id/:guess', (req: Request, res: Response) => {
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
    if (!games.has(gameId)) {
        res.status(404).json({error: 'Game not found'});
    }
    
    const game = games.get(gameId);

    if (!game) {
        res.status(404).json({error: `Game ${gameId} not found`});
        return;
    }

    if (game.finished) {
        res.status(400).json({error: 'Game already finished'});
        return;
    }

    const guessNumber = parseInt(guess);
    const result = game.makeGuess(guessNumber);

    game.solved = result.type === 'solved';
    res.json(result);
});

app.listen(3000, () => {
    console.log('Digidle server running on localhost:3000');
});
