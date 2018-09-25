import { Execution, Show, IProcessAlg } from "../final-tagless";

fdescribe("Final tagless", () => {
  fit("seq", async done => {
    const factory: IProcessAlg<Execution.Brand> = new Execution.Factory();

    const p = factory.seq(
      factory.process(async () => Promise.resolve(1)),
      factory.process(async (x: number) => Promise.resolve(x + 1))
    );

    console.log(await Execution.Brand.prj(p).run({}));
    done();
  });
});
