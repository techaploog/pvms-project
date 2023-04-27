const { seqDiff, createMsgStr } = require("./client.utils");

// * TEST seqDiff utility function
describe("seqDiff", () => {
  test(`[Numeric input] 1LO = 10, TRIM = 9 to be 1`, () => {
    const lastInput = 10;
    const trimInput = 9;
    expect(seqDiff(lastInput, trimInput)).toBe(1);
  });

  test(`[String input] 1LO = "010", TRIM = "009" to be 1`, () => {
    const lastInput = "10";
    const trimInput = "09";

    expect(seqDiff(lastInput, trimInput)).toBe(1);
  });

  test(`1LO = "000", TRIM = "900" to be 100`, () => {
    const lastInput = "000";
    const trimInput = "900";

    expect(seqDiff(lastInput, trimInput)).toBe(100);
  });

  test(`1LO = "010", TRIM = "900" to be 110`, () => {
    const lastInput = "010";
    const trimInput = "900";

    expect(seqDiff(lastInput, trimInput)).toBe(110);
  });

  test(`1LO = "789", TRIM = "304" to be 110`, () => {
    const lastInput = "789";
    const trimInput = "304";
    const tobe = 789 - 304;

    expect(seqDiff(lastInput, trimInput)).toBe(tobe);
  });

  test('Non Numerical lastInput', ()=> {
    const lastInput = "78x9";
    const trimInput = "304";
    expect(seqDiff(lastInput, trimInput)).toBeUndefined();
  });

  test('Non Numerical trimInput', ()=> {
    const lastInput = "789";
    const trimInput = "3a04";
    expect(seqDiff(lastInput, trimInput)).toBeUndefined();
  });

  test('Non Numerical trimInput more than 1000', ()=> {
    const lastInput = "789";
    const trimInput = "3e04";
    expect(seqDiff(lastInput, trimInput)).toBeUndefined();
  });


});

// * TEST createMsgStr utility function
describe("createMsgStr", () => {
  const testMsgObj = {
    receiver: "DF0100",
    sender: "LKA010",
    serial: "0000",
    mode: "1",
    msgLength: "00140",
    procType: "92",
    procRes: " ",
    noOfProc: "001",
    shopCode: "A_",
    lineNo: "0001",
    procName: "T002",
    msg1: Array.from({ length: 3 }, () => " ").join(""),
    ta: "00",
    msg2: Array.from({ length: 3 }, () => " ").join(""),
    wbs: "00",
    msg3: Array.from({ length: 47 }, () => " ").join(""),
  };

  const result = `DF0100LKA010000010014092 001A_0001T002   00   00${testMsgObj.msg3}`;

  test("create string msg", () => {
    expect(createMsgStr(testMsgObj)).toBe(result);
  });
});
