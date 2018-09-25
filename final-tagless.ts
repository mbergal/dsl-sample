// Brand is used to distinguish
//
export interface IProcess<Brand, T, R> {
  // Make interface nominal
  _nominal(tag: [Brand, T, R]): void;
}

// Algebra
export interface IProcessAlg<Brand> {
  _nominal(tag: [Brand]): void;
  process<T, R>(f: ((v: T) => R | Promise<R>)): IProcess<Brand, T, R>;
  seq<T, T1, R>(
    p1: IProcess<Brand, T, T1>,
    p2: IProcess<Brand, T1, R>
  ): IProcess<Brand, T, R>;
}

// Execute program interpreter
export namespace Execution {
  export class Brand {
    _executionBrand: null;
    static prj<T, R>(a: IProcess<Brand, T, R>): Process<T, R> {
      return <Process<T, R>>a;
    }
  }

  interface Process<T, R> extends IProcess<Brand, T, R> {
    run(v: T): Promise<R>;
  }

  export class Factory implements IProcessAlg<Brand> {
    _nominal(tag: [Brand]): void {}
    process<T, R>(f: (v: T) => R | Promise<R>): IProcess<Brand, T, R> {
      const process: Process<T, R> = {
        _nominal(tag: [Brand, T, R]) {},
        async run(v: T): Promise<R> {
          return await f(v);
        }
      };
      return process;
    }

    seq<T, T1, R>(
      p1: IProcess<Brand, T, T1>,
      p2: IProcess<Brand, T1, R>
    ): IProcess<Brand, T, R> {
      const process: Process<T, R> = {
        _nominal(x) {},
        async run(v: T): Promise<R> {
          const r1 = await Brand.prj(p1).run(v);
          const r2 = await Brand.prj(p2).run(r1);
          return r2;
        }
      };
      return process;
    }
  }
}

// Show program structure interpreter
export namespace Show {
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

// This is the most interesting function here
// We can use the same DSL but different interpreters!!
//
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
