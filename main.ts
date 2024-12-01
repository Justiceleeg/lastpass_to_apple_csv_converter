import { parse, stringify } from "jsr:@std/csv";

const text = await Deno.readTextFile("lastpass.csv");
const columns = [
  "url",
  "username",
  "password",
  "totp",
  "extra",
  "name",
  "grouping",
  "fav",
];

const data = parse(text, {
  skipFirstRow: true,
  strip: true,
  columns,
});

type Datum = typeof data[number];
type ErrorMessage = string;

const passwordFilter = (row: Datum): boolean => {
  return Boolean(row.password);
};

const usernameFilter = (row: Datum): boolean => {
  return Boolean(row.username);
};

const nameFilter = (row: Datum): boolean => {
  return Boolean(row.name);
};

const extraNotesFilter = (row: Datum): boolean => {
  return row.url != "http://sn";
};

const weirdCharactersFilter = (row: Datum): boolean => {
  for (const k of columns) {
    const value = row[k];
    if (value) {
      const strArr = value.split("");
      for (const char of strArr) {
        if (char.charCodeAt(0) > 126) {
          return false;
        }
      }
    }
  }
  return true;
};

const filters = [
  { fn: extraNotesFilter, error: "invalid row - no lastpass notes allowed" },
  { fn: weirdCharactersFilter, error: "invalid string in row" },
  { fn: passwordFilter, error: "invalid password" },
  { fn: usernameFilter, error: "invalid username" },
  { fn: nameFilter, error: "invalid site name" },
];
const filteredData = filters.reduce((d, f) => d.filter(f.fn), data);

const badData: (Datum & { error: string; rowNumber: string })[] = [];
for (let i = 0; i < data.length; i++) {
  const row: Datum = data[i];
  for (const filter of filters) {
    if (!filter.fn(row)) {
      badData.push({ error: filter.error, rowNumber: `${i + 2}`, ...row });
      break;
    }
  }
}

const appleColumns = [
  "Title",
  "URL",
  "Username",
  "Password",
  "Notes",
  "OTPAuth",
];
const formatData = (data: Datum) => {
  return {
    "Title": data.name,
    "URL": data.url,
    "Username": data.username,
    "Password": data.password,
    "Notes": data.extra,
    "OTPAuth": "",
  };
};

const formattedData = filteredData.map(formatData);

const goodCsv = stringify(formattedData, {
  columns: appleColumns,
});

await Deno.writeTextFile("goodData.csv", goodCsv);

const badCsv = stringify(badData, {
  columns: ["rowNumber", "error", ...columns],
});

await Deno.writeTextFile("badData.csv", badCsv);
