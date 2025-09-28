import { TradesCsvImporter } from "./trades-csv-importer";
import type { TradesCsvImportModel } from "./types/trades-csv-import-model";

describe("TradesCsvImporter", () => {
  it("parses CSV into a list of entries", () => {
    const csv = [
      "txid,txorderid,pair,aclass,time,type,orderprice,price,cost,fee,vol,margin,misc,ledgers,posttxid,poststatuscode,cprice,ccost,cfee,cvol,cmargin,net,trades",
      "T1,O1,XXBTZEUR,crypto,2024-01-01T12:00:00Z,buy,30000,29950,1000,2,0.0334,,note,L1;L2,PT1,200,29960,1000,2,0.0334,,998,TR1;TR2",
      "T2,O2,XXBTZEUR,crypto,2024-02-02T13:10:00Z,sell,35000,35100,1200,2.4,0.0342,,note2,L3,PT2,200,35110,1200,2.4,0.0342,,1197.6,TR3"
    ].join("\n");

    const list = TradesCsvImporter.parse(csv);
    expect(list).toHaveLength(2);
    const first = list[0] as TradesCsvImportModel;
    expect(first.txid).toBe("T1");
    expect(first.type).toBe("buy");
    expect(first.pair).toBe("XXBTZEUR");
    expect(first.trades).toContain("TR1");
    const second = list[1] as TradesCsvImportModel;
    expect(second.type).toBe("sell");
  });

  it("handles quoted fields and commas", () => {
    const csv = [
      "txid,txorderid,pair,aclass,time,type,orderprice,price,cost,fee,vol,margin,misc,ledgers,posttxid,poststatuscode,cprice,ccost,cfee,cvol,cmargin,net,trades",
      "\"T3\",\"O3\",\"PAIR,WITH,COMMA\",\"crypto\",\"2024-03-03T10:00:00Z\",\"buy\",\"30000\",\"29950\",\"1000\",\"2\",\"0.0334\",\"\",\"note, with comma\",\"L1\",\"PT3\",\"200\",\"29960\",\"1000\",\"2\",\"0.0334\",\"\",\"998\",\"TR4\""
    ].join("\n");
    const list = TradesCsvImporter.parse(csv);
    expect(list).toHaveLength(1);
    expect(list[0].pair).toBe("PAIR,WITH,COMMA");
    expect(list[0].misc).toBe("note, with comma");
  });
});

