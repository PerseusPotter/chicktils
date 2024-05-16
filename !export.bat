@echo off
node !files.js
IF EXIST "chicktils.zip" (
  del "chicktils.zip"
)
"C:\Program Files\7-Zip\7z.exe" a -tzip chicktils.zip @!files.txt