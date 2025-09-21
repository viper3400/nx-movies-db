import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { TradesCsvFileReader } from './trades-csv-file-reader';

describe('TradesCsvFileReader (backend)', () => {
  it('reads a CSV file and parses it', async () => {
    const csv = [
      'txid,txorderid,pair,aclass,time,type,orderprice,price,cost,fee,vol,margin,misc,ledgers,posttxid,poststatuscode,cprice,ccost,cfee,cvol,cmargin,net,trades',
      'T1,O1,XXBTZEUR,crypto,2024-01-01T12:00:00Z,buy,30000,29950,1000,2,0.0334,,note,L1;L2,PT1,200,29960,1000,2,0.0334,,998,TR1;TR2'
    ].join('\n');

    const file = join(tmpdir(), `kraken-trades-${Date.now()}.csv`);
    await fs.writeFile(file, csv, 'utf8');

    const list = await TradesCsvFileReader.readAndParse(file);
    expect(list).toHaveLength(1);
    expect(list[0].txid).toBe('T1');
    expect(list[0].type).toBe('buy');
  });
});

