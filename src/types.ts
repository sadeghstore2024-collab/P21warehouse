/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  modPassword?: string;
}

export interface Product {
  code: string;
  description: string;
  unit: string;
  category?: string; // e.g., Mud Pump, Drawworks
  technicalSpecs?: string;
  stock?: number;
  minStock?: number;
  shelfLocation?: string;
}

export interface Recipient {
  fullName: string;
  orgUnit: string;
  safetyScore?: number;
  trainingCertificates?: TrainingCertificate[];
}

export interface TrainingCertificate {
  id: string;
  title: string;
  date: string;
  expiryDate: string;
  issuer: string;
}

export interface ExitItem {
  id: number;
  productCode?: string;
  productDescription: string;
  category?: string;
  quantity: number;
  unit: string;
  technicalSpecs?: string;
  isLoan?: boolean;
  isReturned?: boolean;
  conditionOnReturn?: string;
  healthRating?: number;
}

export interface ExitRecord {
  id: string;
  docNumber: string;
  items: ExitItem[];
  recipientName: string;
  orgUnit: string;
  delivererName: string;
  date: string;
  timestamp: number;
  type: 'EXIT' | 'PPE';
  signature?: string;
  photo?: string;
  notes?: string;
  telegramMsgId?: number;
}

export interface WaybillItem {
  description: string;
  quantity: string;
  unit: string;
}

export interface Waybill {
  id: string;
  docNumber: string;
  sender: string;
  receiver: string;
  machineHead?: string;
  seniorInCharge?: string;
  registrar: string;
  items: WaybillItem[];
  date: string;
  timestamp: number;
  image?: string;
  notes?: string;
}
