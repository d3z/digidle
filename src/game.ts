enum DigitPlacement {
    wrong,
    misplaced,
    correct
};

type Response = DigitPlacement[] | 'game_over';

export class Game {
    private answer: string;
    private attempts: number;
    
    solved = false;

    constructor(answerNumber: number, private maxAttempts = 5) {
        this.answer = `${answerNumber}`;
        this.attempts = 0;
    }

    get remainingGuesses(): number {
        return this.maxAttempts - this.attempts;
    }

    get finished(): boolean {
        return this.solved || this.remainingGuesses <= 0;
    }

    makeAttempt(guess: number): Response {
        if (!this.finished) {
            this.attempts++;
            return this.checkGuess(guess);
        }
        return 'game_over';
    }

    private checkGuess(guess: number): Response {
        const response: Response= [];
        const guessParts = `${guess}`.split('');
        guessParts.forEach((next, idx) => {
            const nextIdx = this.answer.indexOf(next);
            if (nextIdx === idx) {
                response.push(DigitPlacement.correct);
            } else if (nextIdx === -1) {
                response.push(DigitPlacement.wrong);
            } else {
                response.push(DigitPlacement.misplaced);
            }
        });
        return response;
    }
}
