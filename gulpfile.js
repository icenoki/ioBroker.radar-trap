/*!
 * ioBroker gulpfile
 * Date: 2019-01-28
 */
const gulp = require("gulp");
const replaceRegex = require("gulp-regex-replace");
const fs = require("fs");
const pkg = require("./package.json");
const iopackage = require("./io-package.json");
const {exec} = require("child_process");
const version = (pkg && pkg.version) ? pkg.version : iopackage.common.version;
const translate = require("./lib/tools").translateText;
const languages = {
	en: {},
	de: {},
	ru: {},
	pt: {},
	nl: {},
	fr: {},
	it: {},
	es: {},
	pl: {},
	"zh-cn": {},
};

const arg = (argList => {
	const arg = {};
	let a, opt, thisOpt, curOpt;
	for (a = 0; a < argList.length; a++) {
		thisOpt = argList[a].trim();
		// eslint-disable-next-line no-useless-escape
		opt = thisOpt.replace(/^\-+/, "");

		if (opt === thisOpt) {
			// argument value
			if (curOpt) arg[curOpt] = opt;
			curOpt = null;
		} else {
			// argument name
			curOpt = opt;
			arg[curOpt] = true;
		}
	}

	return arg;
})(process.argv);

async function translateNotExisting(obj, baseText, yandex) {
	let t = obj["en"];
	if (!t) {
		t = baseText;
	}

	if (t) {
		for (const l in languages) {
			if (!obj[l]) {
				const time = new Date().getTime();
				obj[l] = await translate(t, l, yandex);
				console.log("en -> " + l + " " + (new Date().getTime() - time) + " ms");
			}
		}
	}
}

//TASKS

gulp.task("updatePackages", function(done) {
	iopackage.common.version = pkg.version;
	iopackage.common.news = iopackage.common.news || {};
	if (!iopackage.common.news[pkg.version]) {
		const news = iopackage.common.news;
		const newNews = {};

		newNews[pkg.version] = {
			en: "news",
			de: "neues",
			ru: "новое",
			pt: "novidades",
			nl: "nieuws",
			fr: "nouvelles",
			it: "notizie",
			es: "noticias",
			pl: "nowości",
			"zh-cn": "新",
		};
		iopackage.common.news = Object.assign(newNews, news);
	}
	fs.writeFileSync("io-package.json", JSON.stringify(iopackage, null, 4));
	done();
});

gulp.task("updateReadme", (done) => {
	const readme = fs.readFileSync("README.md")
		.toString();
	const pos = readme.indexOf("## Changelog");
	if (pos !== -1) {
		const readmeStart = readme.substring(0, pos + "## Changelog\n".length);
		const readmeEnd = readme.substring(pos + "## Changelog\n".length);

		if (readme.indexOf(version) === -1) {
			const timestamp = new Date();
			const date = `${timestamp.getFullYear()}-${
				(`0${(timestamp.getMonth() + 1).toString(10)}`).slice(-2)}-${
				(`0${(timestamp.getDate()).toString(10)}`).slice(-2)}`;

			let news = "";
			if (iopackage.common.news && iopackage.common.news[pkg.version]) {
				news += `* ${iopackage.common.news[pkg.version].en}`;
			}

			fs.writeFileSync("README.md", `${readmeStart}\n### ${version} (${date})\n${news ? `${news}` : "\n"}${readmeEnd}`);
		}
	}
	done();
});

gulp.task("translate", async function(done) {
	let yandex;
	const i = process.argv.indexOf("--yandex");
	if (i > -1) {
		yandex = process.argv[i + 1];
	}

	if (iopackage && iopackage.common) {
		if (iopackage.common.news) {
			console.log("Translate News");
			for (const k in iopackage.common.news) {
				console.log("News: " + k);
				const nw = iopackage.common.news[k];
				await translateNotExisting(nw, null, yandex);
			}
		}
		if (iopackage.common.titleLang) {
			console.log("Translate Title");
			await translateNotExisting(iopackage.common.titleLang, iopackage.common.title, yandex);
		}
		if (iopackage.common.desc) {
			console.log("Translate Description");
			await translateNotExisting(iopackage.common.desc, null, yandex);
		}

		if (fs.existsSync("./src/i18n/en.json")) {
			const enTranslations = require("./src/i18n/en.json");
			for (const l in languages) {
				console.log("Translate Text: " + l);
				let existing = {};
				if (fs.existsSync("./src/i18n/" + l + ".json")) {
					existing = require("./src/i18n/" + l + ".json");
				}
				for (const t in enTranslations) {
					if (!existing[t]) {
						existing[t] = await translate(enTranslations[t], l, yandex);
					}
				}

				fs.writeFileSync("./src/i18n/" + l + ".json", JSON.stringify(existing, null, 4));
			}
		}

	}
	fs.writeFileSync("io-package.json", JSON.stringify(iopackage, null, 4));

	done();
});

gulp.task("default", gulp.series("updatePackages", "updateReadme"));

gulp.task("ibrUpload", (done) => {
	process.chdir(__dirname + "\\..\\..");
	exec("iobroker.bat upload radar-trap");

	done();
});

gulp.task("visUpload", (done) => {
	const {exec} = require("child_process");

	process.chdir(__dirname + "\\..\\..");
	exec("iobroker.bat visdebug radar-trap");

	done();
});

const regex = iopackage.common.name;
const replace = "radar-trap";

const changeFileName = (done) => {
	fs.rename("public/" + regex + ".png", "public/" + (arg.name ? arg.name : replace) + ".png", (err) => {
		if (err) console.log("ERROR: " + err);
	});

	done();
};

const changeAdapterName = (done) => {
	gulp.src([
		"README.md", "package.json", "io-package.json", "gulpfile.js", "main.js", "src/**/*.jsx", "src/i18n/*.json",
	], {base: "./"}).pipe(replaceRegex({regex: regex, replace: arg.name ? arg.name : replace})).pipe(gulp.dest("."));

	done();
};

gulp.task("changeNames", gulp.series(changeFileName, changeAdapterName));
