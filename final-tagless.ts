interface ExecutingProcess<T, R> {}

interface IProcess<Brand, T, R> {
  // Make interface nominal
  _nominal(tag: [Brand, T, R]): void;
};

// Algebra
interface IProcessAlg<Brand> {
  process<T, R>(f: ((v: T) => R)): IProcess<Brand, T, R>;
  seq<T, T1, R>(
    p1: IProcess<Brand, T, T1>,
    p2: IProcess<Brand, T1, R>
  ): IProcess<Brand, T, R>;
}

class ExecutionBrand<T, R> {
  _nominal(c: [typeof ExecutionBrand, T, R]): void {}
}

interface ExecutingProcess<T, R> extends IProcess<typeof ExecutionBrand, T, R> {
  id: string;
}

class ExecutionFactory implements IProcessAlg<typeof ExecutionBrand> {
  process<T, R>(f: (v: T) => R): IProcess<typeof ExecutionBrand, T, R> {
    const process = <ExecutingProcess<T, R>>{ _nominal(x) {} };
    return process;
  }

  seq<T, T1, R>(
    p1: IProcess<typeof ExecutionBrand, T, T1>,
    p2: IProcess<typeof ExecutionBrand, T1, R>
  ): IProcess<typeof ExecutionBrand, T, R> {
    return <ExecutingProcess<T, R>>{ _nominal(x) {}, id: "" };
  }
}

class PrintBrand {}
class ShowProcess<T, R> implements IProcess<typeof PrintBrand, T, R> {
  value: string;
  constructor(p: string) {
    this.value = p;
  }
  _nominal(x: [typeof PrintBrand, T, R]) {}
}

class PrintFactory implements IProcessAlg<typeof PrintBrand> {
  process<T, R>(f: (v: T) => R): IProcess<typeof PrintBrand, T, R> {
    return new ShowProcess<T, R>("process");
  }

  seq<T, T1, R>(
    p1: IProcess<typeof PrintBrand, T, T1>,
    p2: IProcess<typeof PrintBrand, T1, R>
  ): IProcess<typeof PrintBrand, T, R> {
    const r1 = <ShowProcess<T, R>>(<any>p1);
    const r2 = <ShowProcess<T, R>>(<any>p2);
    return new ShowProcess<T, R>("seq " + r1.value + " " + r2.value);
  }
}

const lf: IProcessAlg<typeof ExecutionBrand> = new ExecutionFactory();
const pf: IProcessAlg<typeof PrintFactory> = new PrintFactory();

const p1 = pf.process((x: string) => 1);

let p2 = pf.process((x: number) => ({
  x: x
}));

const a = pf.seq(p1, p2);
console.log(a);
