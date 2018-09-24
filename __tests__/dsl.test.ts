import { process, seq, run } from "../dsl";

describe("DSL", () => {
  it("seq", async done => {
    const p = seq(
      process(async () => Promise.resolve(1)),
      process(async (x: number) => Promise.resolve(x + 1))
    );
    expect(await run(p, {}, 0)).toEqual(2);
    done();
  });
  it("correctly uses state", async done => {
    const calls: string[] = [];
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
    expect(await run(p, state, 0)).toEqual(2);
    expect(calls).toEqual(["1", "2"]);
    expect(await run(p, state, 0)).toEqual(2);
    done();
  });
});
