export interface Process<T, R> {
  id: string;
  f: (v: T, state: {}) => Promise<R>;
}

export function process<T, R>(f: ((v: T) => Promise<R>)): Process<T, R> {
  return {
    id: "",
    f: f
  };
}

export async function run<T, R>(p: Process<T, R>, state: {}, i: T) {
  const r = await p.f(i, state);
  return r;
}

export function seq<T1, T2, R>(
  p1: Process<T1, T2>,
  p2: Process<T2, R>
): Process<T1, R> {
  return {
    id: "seq",
    async f(v: T1, state: {}): Promise<R> {
      const r1 = await p1.f(v, state);
      const r2 = await p2.f(r1, state);
      return r2;
    }
  };
}

const p = seq(
  process(async () => Promise.resolve(1)),
  process(async (x: number) => Promise.resolve(x + 1))
);
