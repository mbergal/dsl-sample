// Brand is used to distinguish
//
interface IProcess<Brand, T, R> {
  // Make interface nominal
  _nominal(tag: [Brand, T, R]): void;

  // val inj : ’a list → (’a, t) app
  // val prj : (’a, t) app → ’a list
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
    static prj<T, R>(a: IProcess<Brand, T, R>): Process<T, R> {
      return <Process<T, R>>a;
    }
  }

  interface Process<T, R> extends IProcess<Brand, T, R> {}

  export class Factory implements IProcessAlg<Brand> {
    _nominal(tag: [Brand]): void {}
    process<T, R>(f: (v: T) => R): IProcess<Brand, T, R> {
      const process = <Process<T, R>>{
        _nominal(tag: [Brand, T, R]) {}
      };
      return process;
    }

    seq<T, T1, R>(
      p1: IProcess<Brand, T, T1>,
      p2: IProcess<Brand, T1, R>
    ): IProcess<Brand, T, R> {
      return <Process<T, R>>{ _nominal(x) {}, id: "" };
    }
  }
}

namespace Show {
  export class Brand {
    _printBrand: null;
    static prj<T, R>(a: IProcess<Brand, T, R>): Process<T, R> {
      return <Process<T, R>>a;
    }
  }

  export class Process<T, R> implements IProcess<Brand, T, R> {
    value: string;
    constructor(p: string) {
      this.value = p;
    }
    _nominal(x: [Brand, T, R]) {}
  }

  export class Factory implements IProcessAlg<Brand> {
    _nominal(tag: [Brand]): void {}

    process<T, R>(f: (v: T) => R): IProcess<Brand, T, R> {
      return new Process<T, R>("process");
    }

    seq<T, T1, R>(
      p1: IProcess<Brand, T, T1>,
      p2: IProcess<Brand, T1, R>
    ): IProcess<Brand, T, R> {
      const r1 = <Process<T, R>>(<any>p1);
      const r2 = <Process<T, R>>(<any>p2);
      return new Process<T, R>(
        `seq:\n${indent(4, r1.value)}\n${indent(4, r2.value)}`
      );
    }
  }
}

function pipeline<T>(alg: IProcessAlg<T>) {
  return alg.seq(
    alg.seq(
      alg.process((x: string) => 1),
      alg.process((x: number) => x.toString())
    ),
    alg.process((x: string) => parseInt(x))
  );
}

const lf: IProcessAlg<Execution.Brand> = new Execution.Factory();
let pf: IProcessAlg<Show.Brand> = new Show.Factory();

function value<T, R>(v: IProcess<Show.Brand, T, R>): Show.Process<T, R> {
  return <Show.Process<T, R>>v;
}

function indent(indent: number, str: string) {
  const lines = str.split(/(\r?\n)/);
  return lines.map(line => " ".repeat(indent) + line).join("");
}

const p = pipeline(new Show.Factory());
const a = Show.Brand.prj(p);

console.log(a.value);
