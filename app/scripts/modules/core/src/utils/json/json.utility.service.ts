import {module} from 'angular';
import {isPlainObject, isArray, isNumber, isString} from 'lodash';

const DiffMatchPatch = require('expose-loader?diff_match_patch!diff-match-patch');

export interface IDiffDetails {
  type: string;
  text: string;
}

export interface IChangeBlock {
  start: number;
  height: number;
  top: number;
  type: string;
  lines: number;
}

export interface IDiffSummary {
  additions: number;
  removals: number;
  unchanged: number;
  total: number;
}

export interface IJsonDiff {
  details: IDiffDetails[];
  changeBlocks: IChangeBlock[];
  summary: IDiffSummary;
}

export class JsonUtilityService {

  private generateDiff(left: string, right: string): [[number, string]] {
    const dmp: any = new DiffMatchPatch();
    const a = dmp.diff_linesToChars_(left, right);
    const diffs = dmp.diff_main(a.chars1, a.chars2, false);
    dmp.diff_charsToLines_(diffs, a.lineArray);
    return diffs;
  }

  private sortObject(o: any): any {
    if (!o || isNumber(o) || isString(o)) {
      return o;
    }
    // sorting based on http://stackoverflow.com/questions/5467129/sort-javascript-object-by-key/29622653#29622653
    return Object.keys(o).sort().reduce((r: any, k: string) => {
      if (isPlainObject(o[k])) {
        r[k] = this.sortObject(o[k]);
      } else if (isArray(o[k])) {
        r[k] = o[k].map((o2: any) => this.sortObject(o2));
      } else {
        r[k] = o[k];
      }
      return r;
    }, {});
  }

  private makeSortedString(str: string): string {
    return this.makeSortedStringFromObject(JSON.parse(str));
  }

  public makeSortedStringFromObject(obj: any): string {
    return this.makeStringFromObject(this.sortObject(obj));
  }

  public makeStringFromObject(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  public makeSortedStringFromAngularObject(obj: any, omit: string[] = []): string {
    const replacer = (key: string, value: string) => {
      let val = value;
      if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
        val = undefined;
      }
      if (omit.includes(key)) {
        val = undefined;
      }
      return val;
    };
    return JSON.stringify(this.sortObject(obj), replacer);
  }

  public diff(left: any, right: any, sortKeys = false): IJsonDiff {
    if (sortKeys) {
      left = this.makeSortedString(left);
      right = this.makeSortedString(right);
    }
    const diffs = this.generateDiff(left, right);
    const diffLines: IDiffDetails[] = [];
    let additions = 0, removals = 0, unchanged = 0, total = 0;
    const changeBlocks: IChangeBlock[] = [];
    diffs.forEach(diff => {
      const lines = diff[1].split('\n');
      if (lines[lines.length - 1] === '') {
        lines.pop(); // always a trailing new line...
      }
      let type = 'match';
      if (diff[0] === 1) {
        type = 'add';
        additions += lines.length;
        changeBlocks.push({type: type, lines: lines.length, start: total, height: null, top: null});
      }
      if (diff[0] === -1) {
        type = 'remove';
        removals += lines.length;
        changeBlocks.push({type: type, lines: lines.length, start: total, height: null, top: null});
      }
      if (diff[0] === 0) {
        unchanged += lines.length;
      }
      lines.forEach((l: string) => diffLines.push({type: type, text: l}));
      total += lines.length;
    });
    changeBlocks.forEach(b => {
      b.height = b.lines * 100 / total;
      b.top = b.start * 100 / total;
    });
    return {
      details: diffLines,
      summary: { additions, removals, unchanged, total },
      changeBlocks,
    };
  }
}

export const jsonUtilityService = new JsonUtilityService();
export const JSON_UTILITY_SERVICE = 'spinnaker.core.utils.json.service';
module(JSON_UTILITY_SERVICE, []).service('jsonUtilityService', JsonUtilityService);
