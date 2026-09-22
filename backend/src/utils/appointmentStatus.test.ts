import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { canCancelFromStatus, canTransitionTo } from "./appointmentStatus.js";

describe("canTransitionTo", () => {
    test("agendado só avança pra confirmado ou cancelado", () => {
        assert.equal(canTransitionTo("agendado", "confirmado"), true);
        assert.equal(canTransitionTo("agendado", "cancelado"), true);
        assert.equal(canTransitionTo("agendado", "concluido"), false);
        assert.equal(canTransitionTo("agendado", "nao_compareceu"), false);
        assert.equal(canTransitionTo("agendado", "agendado"), false);
    });

    test("confirmado avança pra concluido, cancelado ou nao_compareceu", () => {
        assert.equal(canTransitionTo("confirmado", "concluido"), true);
        assert.equal(canTransitionTo("confirmado", "cancelado"), true);
        assert.equal(canTransitionTo("confirmado", "nao_compareceu"), true);
        assert.equal(canTransitionTo("confirmado", "agendado"), false);
    });

    test("estados finais não têm nenhuma transição de saída", () => {
        for (const final of ["concluido", "cancelado", "nao_compareceu"] as const) {
            for (const target of ["agendado", "confirmado", "concluido", "cancelado", "nao_compareceu"] as const) {
                assert.equal(canTransitionTo(final, target), false, `${final} -> ${target}`);
            }
        }
    });
});

describe("canCancelFromStatus", () => {
    test("só agendado e confirmado podem ser cancelados", () => {
        assert.equal(canCancelFromStatus("agendado"), true);
        assert.equal(canCancelFromStatus("confirmado"), true);
        assert.equal(canCancelFromStatus("concluido"), false);
        assert.equal(canCancelFromStatus("cancelado"), false);
        assert.equal(canCancelFromStatus("nao_compareceu"), false);
    });
});
