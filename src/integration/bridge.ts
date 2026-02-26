import { detectRuntime, RuntimeMode } from './environment';

type Listener<T> = (event: T) => void;

export class IntegrationBridge<In, Out> {
  private started = false;
  private mode: RuntimeMode = 'standalone';
  private listeners: Listener<In>[] = [];

  start() {
    if (this.started) return;

    this.mode = detectRuntime();

    if (this.mode === 'embedded') {
      window.addEventListener('message', this.handleMessage);
    }

    this.started = true;
  }

  stop() {
    if (!this.started) return;

    if (this.mode === 'embedded') {
      window.removeEventListener('message', this.handleMessage);
    }

    this.started = false;
  }

  emit(event: Out) {
    if (this.mode !== 'embedded') return;

    window.parent.postMessage(event, '*');
  }

  on(listener: Listener<In>) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private handleMessage = (e: MessageEvent) => {
    if (this.mode !== 'embedded') return;

    const event = e.data as In;

    if (!event || typeof event !== 'object' || !('type' in event)) {
      return;
    }

    this.listeners.forEach(listener => listener(event));
  };
}