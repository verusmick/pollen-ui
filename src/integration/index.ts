export { IntegrationBridge } from './bridge';
export { detectRuntime } from './environment';
export type { HostToAppEvent, AppToHostEvent } from './contract';
import { IntegrationBridge } from './bridge';
import type { HostToAppEvent, AppToHostEvent } from './contract';

export const bridge = new IntegrationBridge<
  HostToAppEvent,
  AppToHostEvent
>();