import { Tokenizer } from "./tokenizer";
import { evaluateBinaryOperation } from "./utils";
import { Operator } from "./types";

export abstract class Expression {
  protected readonly tokenizer: Tokenizer;

  constructor(tokenizer: Tokenizer, expression?: string) {
    this.tokenizer = tokenizer;
    if (expression !== undefined) {
      this.tokenizer.setExpression(expression);
    }
  }

  abstract evaluate(): number[];
}

export class DefaultExpression extends Expression {
  public evaluate(): number[] {
    const tokenized = this.tokenizer.tokenize();

    if (tokenized.length === 0) {
      return [];
    }

    if (tokenized.length === 1) {
      return [parseInt(tokenized[0])];
    }

    if (tokenized.length === 3) {
      const num = evaluateBinaryOperation(
        parseInt(tokenized[0]),
        tokenized[1] as Operator,
        parseInt(tokenized[2])
      );
      if (num !== undefined) {
        return [num];
      }
      return [];
    }

    const results: number[] = [];

    for (let i = 1; i < tokenized.length; i += 2) {
      const leftTokenizer = this.tokenizer.clone();
      leftTokenizer.setExpression(tokenized.slice(0, i).join(""));
      const leftExpr = new DefaultExpression(leftTokenizer);
      const rightTokenizer = this.tokenizer.clone();
      rightTokenizer.setExpression(tokenized.slice(i + 1).join(""));
      const rightExpr = new DefaultExpression(rightTokenizer);

      const leftResults = leftExpr.evaluate();
      const rightResults = rightExpr.evaluate();

      for (const left of leftResults) {
        for (const right of rightResults) {
          const val = evaluateBinaryOperation(
            left,
            tokenized[i] as Operator,
            right
          );
          if (val !== undefined) {
            results.push(val);
          }
        }
      }
    }

    return results;
  }
}
