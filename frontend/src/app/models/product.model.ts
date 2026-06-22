export interface Product {
  Name: string;
  Family: string;
  ProductType: string;
  BillingCycle: string;
  Term: string;
  ListPrice: number;
  PurchasePrice: number;
  PartNumber: string;
  Currency: string;
  MinQuantity: number;
  MaxQuantity: number;
  Description: string;
}

export interface ProductFilter {
  search: string;
  family: string;
  billingCycle: string;
  productType: string;
}