import { Message, TransferEvent } from "../types";
import { TerraEvent, TerraMessage } from "@subql/types-terra";
import { MsgExecuteContract } from "@terra-money/terra.js";

export async function handleMessage(
  msg: TerraMessage<MsgExecuteContract>
): Promise<void> {
  const record = new Message(`${msg.tx.tx.txhash}-${msg.idx}`);
  record.blockHeight = BigInt(msg.block.block.block.header.height);
  record.txHash = msg.tx.tx.txhash;
  record.contract = msg.msg.toData().contract;
  record.sender = msg.msg.toData().sender;
  record.executeMsg = JSON.stringify(msg.msg.toData().execute_msg);
  await record.save();
}

export async function handleEvent(
  event: TerraEvent<MsgExecuteContract>
): Promise<void> {
  const record = new TransferEvent(
    `${event.tx.tx.txhash}-${event.msg.idx}-${event.idx}`
  );
  record.blockHeight = BigInt(event.block.block.block.header.height);
  record.txHash = event.tx.tx.txhash;
  for (const attr of event.event.attributes) {
    switch (attr.key) {
      case "sender":
        record.sender = attr.value;
        break;
      case "recipient":
        record.recipient = attr.value;
        break;
      case "amount":
        record.amount = attr.value;
        break;
      default:
    }
  }
  await record.save();
}
