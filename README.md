A simple script to convert the csv exported by lastpass into the format Apple's
Password app can read. Binary is included.

1. Rename lastpass export csv to `lastpass.csv`
2. Move `lastpass.csv` into this `lastpass_to_apple_csv_converter` folder
3. In terminal run `./convert_csv`*. This generates two new files: `badData.csv`
   and `goodData.csv` If there are issues here try to troubleshoot problematic
   rows in Excel or Numbers.
4. Review `badData.csv` to see errors in formatting
5. Review `goodData.csv`
6. Use `goodData.csv` to import into Apple's Password app

*if you have issues with running a stranger's binary from the internet you can
download deno and build/run from source.
