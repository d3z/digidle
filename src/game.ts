enum DigitPlacement {
    wrong,
    misplaced,
    correct
};

type Response = DigitPlacement[] | 'game_over' | 'solved';

export class Game {
    private answer: Map<string, number[]>;
    
    attempts = 0;
    solved = false;

    constructor(answerNumber: number, private maxAttempts = 5) {
        this.answer = this.processAnswer(answerNumber);
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

    private processAnswer(answerNumber: number): Map<string,  number[]> {
        const answerParts = `${answerNumber}`.split('');
        const answer = new Map<string, number[]>();

        answerParts.forEach((nextDigit, idx) => {
            const indices = answer.getOrInsert(nextDigit, []);
            indices.push(idx);
            answer.set(nextDigit, indices);
        });

        return answer;
    }

    private checkGuess(guess: number): Response {
        const response: Response = [];
        const guessParts = `${guess}`.split('');
        guessParts.forEach((next, idx) => {
            if (this.answer.has(next)) {
                const indices = this.answer.get(next);
                if (indices.includes(idx)) {
                    response.push(DigitPlacement.correct);
                } else {
                    response.push(DigitPlacement.misplaced);
                }
            } else {
                response.push(DigitPlacement.wrong);
            }
        });
        if (this.isSolved(response)) {
            return 'solved';
        }
        return response;
    }

    private isSolved(response: Response): boolean{
        if (response === 'solved') return true;
        if (response === 'game_over') return false;

        for (const result of response) {
            if (result != DigitPlacement.correct) {
                return false;
            }
        }
        return true;
    }
}
