import express, {type Request, type Response} from 'express';
import { Game } from './game.ts';

const app = express();
app.use(express.json());

const games: Map<number, Game> = new Map<number, Game>();
let nextGameId = 0;

app.post('/games', (_: Request, res: Response) => {
    const randomAnswer = Math.floor(Math.random() * (2026 - 1900 + 1)) + 1900;
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
        };
        gamesData.push(gameResult);
    }
    res.json(gamesData);
});

app.put('/games/:id/:guess', (req: Request, res: Response) => {
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
    const guessNumber = parseInt(guess);
    const response = game?.makeAttempt(guessNumber);
    if (response === 'solved') {
        game.solved = true;
    }
    res.json({response});
});

app.listen(3000, () => {
    console.log('Digidle server running on localhost:3000');
});
