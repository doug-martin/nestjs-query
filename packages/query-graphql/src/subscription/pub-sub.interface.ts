export interface GraphQLPubSub {
  publish(triggerName: string, payload: any): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/ban-types
  subscribe(triggerName: string, onMessage: Function, options: Object): Promise<number>;
  unsubscribe(subId: number): any;
  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
}
