import Conf from "conf";

export class SettingManager {
  private readonly settings: Conf;

  constructor(directory: string) {
    this.settings = new Conf({
      cwd: directory
    });
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.settings.get(key, defaultValue) as T | undefined;
  }

  set<T>(key: string, v: T | undefined): void {
    this.settings.set(key, v);
  }

  delete(key: string): void {
    this.settings.delete(key);
  }

  has(key: string): boolean {
    return this.settings.has(key);
  }
}
