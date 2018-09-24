export interface Process<T, R> {
  id: string;
  f: (v: T, id: string, state: {}) => Promise<R>;
}

export function process<T, R>(f: ((v: T) => Promise<R>)): Process<T, R> {
  return {
    id: "",
    async f(v: T, id: string, state: { [id: string]: any }) {
      if (state[id] === undefined) {
        console.log(`Running ${id}`);
        state[id] = await f(v);
      }
      return state[id];
    }
  };
}

export async function run<T, R>(p: Process<T, R>, id: string, state: {}, i: T) {
  const r = await p.f(i, id, state);
  return r;
}

export function seq<T1, T2, R>(
  p1: Process<T1, T2>,
  p2: Process<T2, R>
): Process<T1, R> {
  return {
    id: "seq",
    async f(v: T1, id: string, state: { [id: string]: any }): Promise<R> {
      const thisProcessId = `${id}.seq`;
      if (state[thisProcessId] === undefined) {
        console.log(`Running ${thisProcessId}`);
        const r1 = await p1.f(v, `${thisProcessId}.1`, state);
        const r2 = await p2.f(r1, `${thisProcessId}.2`, state);
        state[thisProcessId] = r2;
      }
      return state[thisProcessId];
    }
  };
}

export function par<T, R1, R2>(
  p1: Process<T, R1>,
  p2: Process<T, R2>
): Process<T, [R1, R2]> {
  return {
    id: "par",
    async f(v: T, id: string, state: { [id: string]: any }): Promise<[R1, R2]> {
      const thisProcessId = `${id}.par`;
      if (state[thisProcessId] === undefined) {
        console.log(`Running ${thisProcessId}`);
        const [r1, r2] = await Promise.all([
          p1.f(v, `${thisProcessId}.1`, state),
          p2.f(v, `${thisProcessId}.2`, state)
        ]);
        state[thisProcessId] = [r1, r2];
      }
      return state[thisProcessId];
    }
  };
}
