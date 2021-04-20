

export class Dependencies {
	private mapping = new Map<string, Set<string>>();

	private addEntry(name: string) {
		let existing = this.mapping.get(name);
		if (!existing)
			this.mapping.set(name, existing = new Set());

		return existing;
	}

	clear() {
		this.mapping.clear();
	}

	add(file: string, dependencies: string[]) {
		file = file.toLowerCase();
		this.addEntry(file);

		dependencies.forEach(dep => {
			this.addEntry(dep.toLowerCase()).add(file);
		});
	}

	remove(path: string) {
		path = path.toLowerCase();
		this.mapping.delete(path);
	}

	mapDeps<T>(file: string, cb: (affectedfile: string) => T) {
		const results: T[] = [cb(file)];
		const dependants = this.mapping.get(file.toLowerCase());
		if (dependants) {
			dependants.forEach(dep => results.push(cb(dep)));
		}
		return results;
	}

	isOurFile(path: string) {
		return this.mapping.has(path.toLowerCase());
	}
}
