import fs from 'fs';
import path from 'path';

export class JsonStorage<T> {
  private filePath: string;
  private data: T;

  constructor(filename: string, initialData: T) {
    this.filePath = path.resolve(process.cwd(), 'data', filename);
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (fs.existsSync(this.filePath)) {
      this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
    } else {
      this.data = initialData;
      this.save();
    }
  }

  get(): T {
    return this.data;
  }

  set(newData: T) {
    this.data = newData;
    this.save();
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }
}
