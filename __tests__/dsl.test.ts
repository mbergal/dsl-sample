import { process, seq, par, run } from "../dsl";

describe("DSL", () => {
  it("seq", async done => {
    const p = seq(
      process(async () => Promise.resolve(1)),
      process(async (x: number) => Promise.resolve(x + 1))
    );
    expect(await run(p, "", {}, 0)).toEqual(2);
    done();
  });

  it("par", async done => {
    const p = par(
      process(async () => Promise.resolve(1)),
      process(async () => Promise.resolve(2))
    );
    expect(await run(p, "", {}, 0)).toEqual([1, 2]);
    done();
  });

  fit("complex", async done => {
    const p = seq(
      seq(
        process(() => Promise.resolve(1)),
        par<number, number, string>(
          process(x => Promise.resolve(x + 1)),
          process(x => Promise.resolve(x.toString()))
        )
      ),
      process((x: [number, string]) => Promise.resolve(x))
    );

    const r = await run(p, "", {}, 1);
    console.log(r);
    done();
  });
  it("correctly uses state", async done => {
    let calls: string[] = [];
    const p = seq(
      process(async () => {
        calls.push("1");
        return Promise.resolve(1);
      }),
      process(async (x: number) => {
        calls.push("2");
        return Promise.resolve(x + 1);
      })
    );
    const state = {};
    expect(await run(p, "", state, 0)).toEqual(2);
    expect(calls).toEqual(["1", "2"]);
    calls = [];
    expect(await run(p, "", state, 0)).toEqual(2);
    expect(calls).toEqual([]);
    done();
  });
});
