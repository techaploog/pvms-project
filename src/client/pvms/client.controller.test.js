const {
  getCalculatedTA,
  getCalculatedWBS,
  getMessageToSend,
} = require("./client.controller");

const {
  extractTrimSeq,
  getLastInputSeq,
  extractWBS,
} = require("./client.model");

const { createMsgStr } = require("./utils/client.utils");

// === mock data ====
const MSG_INIT = {
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
  ta: 0,
  msg2: Array.from({ length: 3 }, () => " ").join(""),
  wbs: 0,
  msg3: Array.from({ length: 47 }, () => " ").join(""),
};

const mockL0Data = {
  id: "test_id",
  serverTime: "2023-04-29",
  trackPoint: "1L0",
  bodyNo: "12345",
  bcSeq: "070",
};

const mockGetLastInputSeq = {
  data: mockL0Data,
  isNew: true,
};

const mockExtractTrimSeq = [
  ["111111", "28065", "2023-04-28"],
  ["111112", "28064", "2023-04-28"],
  ["111113", "28063", "2023-04-28"],
];

const mockExtractWBS = "32";
// =========

jest.mock("./client.model");

describe("Test getCalculatedTA function", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("It should return { success: true, numVeh: 5 }", async () => {
    getLastInputSeq.mockResolvedValue(mockGetLastInputSeq);
    extractTrimSeq.mockResolvedValue(mockExtractTrimSeq);

    const result = { success: true, numVeh: 5 };
    const testResult = await getCalculatedTA();

    expect(testResult).toEqual(result);
  });

  it("isNew = false : It should return data", async () => {
    const sameInput = {
      ...mockGetLastInputSeq,
      isNew: false,
    };

    getLastInputSeq.mockResolvedValue(sameInput);
    extractTrimSeq.mockResolvedValue(mockExtractTrimSeq);

    const result = { success: true, numVeh: 5 };
    const testResult = await getCalculatedTA();

    expect(testResult).toEqual(result);
  });

  it("No Trim data : It should return {success:false, numVeh:undefined}", async () => {
    getLastInputSeq.mockResolvedValue(mockGetLastInputSeq);
    extractTrimSeq.mockResolvedValue([]);

    const result = { success: false, numVeh: undefined };
    const testResult = await getCalculatedTA();

    expect(testResult).toEqual(result);
  });
});

describe("Test getCalculatedWBS function", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("It should return {success:true, numVeh:32}", async () => {
    extractWBS.mockResolvedValue(mockExtractWBS);

    const result = { success: true, numVeh: 32 };
    const testResult = await getCalculatedWBS();
    expect(testResult).toEqual(result);
  });

  it("It should return {success:false, numVeh:undefined}", async () => {
    extractWBS.mockResolvedValue(undefined);

    const result = { success: false, numVeh: undefined };
    const testResult = await getCalculatedWBS();
    expect(testResult).toEqual(result);
  });

  it("WBS is not number : It should return {success:false, numVeh:undefined}", async () => {
    extractWBS.mockResolvedValue("ABCD");

    const result = { success: false, numVeh: undefined };
    const testResult = await getCalculatedWBS();
    expect(testResult).toEqual(result);
  });

  it("WBS > 99 : It should return {success:true, numVeh:99}", async() => {
    extractWBS.mockResolvedValue("1000");
    
    const result = {success:true, numVeh:99};
    const testResult = await getCalculatedWBS();
    expect(testResult).toEqual(result);
  });

});

describe("Test getMessageToSend function", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("It should return correct string", async () => {
    getLastInputSeq.mockResolvedValue(mockGetLastInputSeq);
    extractTrimSeq.mockResolvedValue(mockExtractTrimSeq);
    extractWBS.mockResolvedValue(mockExtractWBS);

    const expectResult1 = createMsgStr({ ...MSG_INIT, ta: "05", wbs: "32" });
    const expectResult2 = createMsgStr({ ...MSG_INIT, ta: "05", wbs: "32", serial:"0001" });
    const expectResult3 = createMsgStr({ ...MSG_INIT, ta: "05", wbs: "32", serial:"0002" });
    const expectResult4 = createMsgStr({ ...MSG_INIT, ta: "05", wbs: "32", serial:"0003" });

    const test1 = await getMessageToSend();
    expect(test1).toEqual(expectResult1);

    const test2 = await getMessageToSend(resend=true);
    expect(test2).toEqual(expectResult1);

    const test3 = await getMessageToSend();
    expect(test3).toEqual(expectResult2);

    const test4 = await getMessageToSend(resend=true);
    expect(test4).toEqual(expectResult2);

    const test5 = await getMessageToSend();
    expect(test5).toEqual(expectResult3);

    const test6 = await getMessageToSend();
    expect(test6).toEqual(expectResult4);

  });
});
