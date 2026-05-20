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
        // A game is finished if it's been solved or there
        // are no more guesses allowed.
        return this.solved || this.remainingGuesses <= 0;
    }

    get answer(): string {
        // We only want to return the actual answer
        // if the game has already finished.
        if (this.finished) {
            return this._answer;
        }
        return 'X'.repeat(this._answer.length);
    }

    makeGuess(guess: number): Response {
        if (!this.finished) {
            this.attempts++;
            return this.checkGuess(guess);
        }
        return 'game_over';
    }

    private processAnswer(answerNumber: number): Map<string,  number[]> {
        // We take the answer generated for this game and pre-process it
        // so that we have all the digits and their indices propulated 
        // and ready to match against guesses.
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

        // We'll take a copy of the processed answer so we can mutate it
        const answer = new Map([...this._processedAnswer]);

        // First things first, we'll find all the correctly placed guesses
        // and remove those from our process answer...
        for (const [digit, indices] of answer) {
            const remainingIndices = [];
            for (const idx of indices) {
                if (guessParts[idx] === digit) {
                    response[idx] = DigitPlacement.correct;
                } else {
                    remainingIndices.push(idx);
                }
            }
            // Check if there are any indices left for this
            // digit and if not, simply remove it from the 
            // answer so that it's not checked in the next step.
            if (remainingIndices.length > 0) {
                answer[digit] = remainingIndices;
            } else {
                answer.delete(digit);
            }
        }

        // ...and then look through what's left of our answer and check
        // if what's left is misplaced or wrong.
        guessParts.forEach((next, idx) => {
            if (!response[idx]) {
                if (answer.has(next)) {
                    response[idx] = DigitPlacement.misplaced;
                } else {
                   response[idx] = DigitPlacement.wrong;
                }
            }
        });

        if (this.isSolved(response)) {
            return 'solved';
        }
        return response;
    }

    private isSolved(response: Response): boolean {
        if (response === 'solved') return true;
        if (response === 'game_over') return false;

        return response.every(r => r === DigitPlacement.correct);
    }
}
