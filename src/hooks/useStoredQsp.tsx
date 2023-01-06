import { useEffect } from "react";
import {
  BooleanParam,
  DateParam,
  DelimitedArrayParam,
  DelimitedNumericArrayParam,
  JsonParam,
  NumberParam,
  QueryParamConfig,
  StringParam,
  useQueryParam,
} from "use-query-params";

const getParamConfig = (paramType: ParamTypes): QueryParamConfig<any> => {
  switch (paramType) {
    case "string":
      return StringParam;
    case "number":
      return NumberParam;
    case "stringArray":
      return DelimitedArrayParam;
    case "numberArray":
      return DelimitedNumericArrayParam;
    case "json":
      return JsonParam;
    case "date":
      return DateParam;
    case "boolean":
      return BooleanParam;
    default:
      throw new Error("Unaccepted Parameter Type");
  }
};

interface UpdateOptions {
  addToHistory?: boolean;
}

interface TypeMap {
  string: string;
  number: number;
  stringArray: string[];
  numberArray: number[];
  date: Date;
  boolean: boolean;
  json: object;
}

type ParamTypes = keyof TypeMap;
type BorT<T extends ParamTypes | object> = T extends ParamTypes ? TypeMap[T] : T;

function useStoredQsp<B extends object>(
  paramName: string,
  paramType: "json",
  initialState?: B
): [B | undefined, (newState: B, options?: UpdateOptions) => void];
function useStoredQsp<T extends ParamTypes>(
  paramName: string,
  paramType: T,
  initialState?: TypeMap[T]
): [TypeMap[T] | undefined, (newState: TypeMap[T], options?: UpdateOptions) => void];
function useStoredQsp<T extends ParamTypes | object>(paramName: string, paramType: ParamTypes, initialState?: BorT<T>) {
  const [qsp, setQsp] = useQueryParam(paramName, getParamConfig(paramType));

  const storeValue = (newState: BorT<T>) => {
    const encodedValue = getParamConfig(paramType).encode(newState);
    if (newState === undefined) return;
    if (typeof encodedValue === "string") {
      sessionStorage.setItem(`syncedQsp-${paramName}`, encodedValue);
    } else if (typeof encodedValue !== "string")
      console.error("hmmm, this is not a string", encodedValue, "its", typeof encodedValue);
  };

  const updateQsp = (newState: BorT<T>, options?: UpdateOptions) => {
    const addToHistory = options?.addToHistory === undefined || options?.addToHistory;
    setQsp(newState, addToHistory ? "pushIn" : "replaceIn");
    storeValue(newState);
  };

  useEffect(() => {
    if (qsp !== undefined) {
      storeValue(qsp);
      return;
    }

    const storedValue = sessionStorage.getItem(`syncedQsp-${paramName}`);
    if (storedValue) {
      updateQsp(getParamConfig(paramType).decode(storedValue));
      return;
    }

    if (initialState) {
      updateQsp(initialState, { addToHistory: false });
    }
  }, []);

  return [qsp, updateQsp];
}

export default useStoredQsp;
