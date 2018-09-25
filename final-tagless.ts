interface ExecutingProcess<T, R> {}

interface IProcess<Brand, T, R> {
  // Make interface nominal
  _nominal(tag: [Brand, T, R]): void;
}

// Algebra
interface IProcessAlg<Brand> {
  _nominal(tag: [Brand]): void;
  process<T, R>(f: ((v: T) => R)): IProcess<Brand, T, R>;
  seq<T, T1, R>(
    p1: IProcess<Brand, T, T1>,
    p2: IProcess<Brand, T1, R>
  ): IProcess<Brand, T, R>;
}

namespace Execution {
export class Brand {
  _executionBrand: null;
}

interface ExecutingProcess<T, R> extends IProcess<Brand, T, R> {
}

export class Factory implements IProcessAlg<Brand> {
  _nominal(tag: [Brand]): void {}
  process<T, R>(f: (v: T) => R): IProcess<Brand, T, R> {
    const process = <ExecutingProcess<T, R>>{ _nominal(tag: [Brand, T, R]) {} };
    return process;
  }

  seq<T, T1, R>(
    p1: IProcess<Brand, T, T1>,
    p2: IProcess<Brand, T1, R>
  ): IProcess<Brand, T, R> {
    return <ExecutingProcess<T, R>>{ _nominal(x) {}, id: "" };
  }
}
}

namespace Print {
export class Brand {
  _printBrand: null;
}

class ShowProcess<T, R> implements IProcess<Brand, T, R> {
  value: string;
  constructor(p: string) {
    this.value = p;
  }
  _nominal(x: [Brand, T, R]) {}
}

export class Factory implements IProcessAlg< Brand> {
  _nominal(tag: [Brand]): void {}

  process<T, R>(f: (v: T) => R): IProcess< Brand, T, R> {
    return new ShowProcess<T, R>("process");
  }

  seq<T, T1, R>(
    p1: IProcess< Brand, T, T1>,
    p2: IProcess< Brand, T1, R>
  ): IProcess< Brand, T, R> {
    const r1 = <ShowProcess<T, R>>(<any>p1);
    const r2 = <ShowProcess<T, R>>(<any>p2);
    return new ShowProcess<T, R>(`seq:\n  ${r1.value}\n  ${r2.value}`);
  }
}
}

const lf: IProcessAlg<Execution.Brand> = new Execution.Factory();
let pf: IProcessAlg<Print.Brand> = new Print.Factory();

const p1 = pf.process((x: string) => 1);

let p2 = pf.process((x: number) => ({
  x: x
}));

function value<T, R>(
  v: IProcess<typeof PrintFactory, T, R>
): ShowProcess<T, R> {
  return <ShowProcess<T, R>>v;
}

const a = value(pf.seq(p1, p2));
console.log(a.value);
