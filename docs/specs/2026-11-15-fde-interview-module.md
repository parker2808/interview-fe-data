# FDE interview module: content contract

AC1. A separate `fde/fde-prep.json` contains bilingual, self-contained JD, concept, interview, pitch, rescue, interviewer-question and cheat-sheet entries. Verify with `node scripts/check-fde.mjs .`.
AC2. Interview coverage includes I1-I33, J1-J12, B1-B14 and R1-R12. Verify with the content gate.
AC3. Personal claims distinguish observed work from proposed designs and general knowledge. Behavioral placeholders stay visible. Verify by reviewing the JSON and checking the gate.
AC4. Existing KB, plan, practice and Q&A indexes remain unchanged. Run the existing repository gates.

The app PR consumes this collection through a server endpoint. Merge data first, app second. Neither PR authorizes merge or deployment.
