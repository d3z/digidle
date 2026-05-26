export enum DigitPlacement {
    wrong,
    misplaced,
    correct
};

type ResultWithAnswer = {answer:string}
export type UnsovledResult = {type:'unsolved', result: DigitPlacement[], remainingGuesses:number}
export type SolvedResult = ResultWithAnswer & {type:'solved'}
export type GameOverResult = ResultWithAnswer & {type:'game_over', solved: boolean}
export type GuessResult = UnsovledResult | SolvedResult | GameOverResult