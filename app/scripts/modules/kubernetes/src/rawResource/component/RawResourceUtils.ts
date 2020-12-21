export class RawResourceUtils {
  static namespaceDisplayName(ns: string): string {
    if (ns === null || ns == '') {
      return RawResourceUtils.GLOBAL_LABEL;
    }
    return ns;
  }
  static GLOBAL_LABEL = '(global)';
}
