import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "./slugify.js";

test("remove acento, põe em minúsculas e troca espaço por hífen", () => {
    assert.equal(slugify("Barbearia do João"), "barbearia-do-joao");
});

test("colapsa caracteres especiais e remove hífens das pontas", () => {
    assert.equal(slugify("  --Barber & Co.!!  "), "barber-co");
});

test("nome só com símbolos vira string vazia (o service usa fallback)", () => {
    assert.equal(slugify("!!!"), "");
});
