enum DigitPlacement {
    wrong,
    misplaced,
    correct
};

type Response = DigitPlacement[] | 'game_over' | 'solved';

export class Game {
    private _processedAnswer: Map<string, number[]>;
    private _answer: string;
    
    attempts = 0;
    solved = false;

    constructor(answer: number, private maxAttempts = 5) {
        this._processedAnswer = this.processAnswer(answer);
        this._answer = `${answer}`;
    }

    get remainingGuesses(): number {
        return this.maxAttempts - this.attempts;
    }

    get finished(): boolean {
        return this.solved || this.remainingGuesses <= 0;
    }

    get answer(): string {
        if (this.finished) {
            return this._answer;
        }
        return 'X'.repeat(this._answer.length);
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
        const answer = new Map([...this._processedAnswer]);
        for (const [digit, indices] of answer) {
            const remainingIndices = [];
            for (const idx of indices) {
                if (guessParts[idx] === digit) {
                    response[idx] = DigitPlacement.correct;
                } else {
                    remainingIndices.push(idx);
                }
            }
            if (remainingIndices.length > 0) {
                answer[digit] = remainingIndices;
            } else {
                delete answer[digit];
            }
        }
        guessParts.forEach((next, idx) => {
            if (answer.has(next)) {
                if (!response[idx]) {
                    response[idx] = DigitPlacement.misplaced;
                }
            } else {
                response[idx] = DigitPlacement.wrong;
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
