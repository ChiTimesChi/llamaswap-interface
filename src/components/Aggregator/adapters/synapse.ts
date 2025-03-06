import BigNumber from 'bignumber.js';
import { sendTx } from '../utils/sendTx';

// TODO: figure out why .env approach doesn't work
const API_URL = 'https://bridge-api-staging-swap-v2.up.railway.app';

export const name = 'Synapse';
export const token = 'SYN';

export const chainToId = {
	arbitrum: 42161,
	base: 8453,
	blast: 81457,
	bsc: 56,
	ethereum: 1,
	linea: 59144,
	optimism: 10,
	scroll: 534352
};

export function approvalAddress() {
	return '0x0000000051250060EEC6bc1Bd37dC3eF30c9be25';
}

export async function getQuote(chain: string, from: string, to: string, amount: string, { userAddress, slippage }) {
	const requestURL = `${API_URL}/swap/v2?chain=${chainToId[chain]}&fromToken=${from}&toToken=${to}&amount=${amount}&address=${userAddress}&slippage=${slippage}`;
	console.log(requestURL);
	const data = await fetch(requestURL).then((r) => r.json());
	if (data.error) {
		throw new Error(data.error);
	}
	if (data.callData) {
		data.callData.value = new BigNumber(data.callData.value || '0');
	}
	return {
		amountReturned: data.maxAmountOut,
		estimatedGas: 0,
		tokenApprovalAddress: approvalAddress(),
		rawQuote: data.callData || {}
	};
}

export async function swap({ fromAddress, rawQuote, chain }) {
	const tx = await sendTx({
		from: fromAddress,
		to: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote.to,
	data: rawQuote.data,
	value: rawQuote.value
});
