import { addressSchema, type AddressValues } from '../model/address-schema';

export function isAddressReady(values: AddressValues): boolean {
  return addressSchema.safeParse(values).success;
}
