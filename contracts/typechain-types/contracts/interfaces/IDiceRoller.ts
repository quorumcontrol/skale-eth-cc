/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export interface IDiceRollerInterface extends utils.Interface {
  functions: {
    "getRandom()": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "getRandom"): FunctionFragment;

  encodeFunctionData(functionFragment: "getRandom", values?: undefined): string;

  decodeFunctionResult(functionFragment: "getRandom", data: BytesLike): Result;

  events: {};
}

export interface IDiceRoller extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IDiceRollerInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    getRandom(overrides?: CallOverrides): Promise<[string] & { rnd: string }>;
  };

  getRandom(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    getRandom(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    getRandom(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    getRandom(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
