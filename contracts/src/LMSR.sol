// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Logarithmic Market Scoring Rule pricing library.
// Uses a fixed-point approximation for e^x and ln(x) scaled to 1e18.
// b is the liquidity parameter — higher b means less price impact per bet.
library LMSR {
    uint256 internal constant SCALE = 1e18;
    // b is stored scaled by SCALE (e.g. b=100 => bScaled=100e18)

    // Cost to move from quantities q[] to q[] with q[outcome] += amount.
    // cost = b * ln( sum(e^(q[i]/b)) after - sum(e^(q[i]/b)) before )
    // All inputs scaled by SCALE. Returns cost scaled by SCALE.
    function cost(
        uint256[3] memory q,
        uint8 outcome,
        uint256 amount,
        uint256 b
    ) internal pure returns (uint256) {
        uint256 sumBefore = _expSum(q, b);
        uint256[3] memory qAfter = q;
        qAfter[outcome] += amount;
        uint256 sumAfter = _expSum(qAfter, b);
        // cost = b * ln(sumAfter / sumBefore)
        return b * _ln(sumAfter * SCALE / sumBefore) / SCALE;
    }

    // Price (probability) of outcome i given quantities q[].
    // price_i = e^(q[i]/b) / sum(e^(q[j]/b))
    function price(
        uint256[3] memory q,
        uint8 outcome,
        uint256 b
    ) internal pure returns (uint256) {
        uint256 s = _expSum(q, b);
        uint256 ei = _exp(q[outcome] * SCALE / b);
        return ei * SCALE / s;
    }

    // ── internal helpers ──────────────────────────────────────────────────

    function _expSum(uint256[3] memory q, uint256 b) private pure returns (uint256 s) {
        for (uint8 i = 0; i < 3; i++) {
            s += _exp(q[i] * SCALE / b);
        }
    }

    // e^x approximation via Taylor series, x scaled by SCALE.
    // Accurate for x in [0, 10e18]. Reverts on overflow.
    function _exp(uint256 x) private pure returns (uint256 result) {
        // scale down to avoid overflow: e^x = (e^(x/8))^8
        uint256 y = x / 8;
        result = SCALE + y;
        uint256 term = y;
        for (uint256 i = 2; i <= 20; i++) {
            term = term * y / (i * SCALE);
            result += term;
            if (term < 1) break;
        }
        // square 3 times = ^8
        result = result * result / SCALE;
        result = result * result / SCALE;
        result = result * result / SCALE;
    }

    // ln(x) for x scaled by SCALE. Uses ln(x) = 2*atanh((x-1)/(x+1)).
    function _ln(uint256 x) private pure returns (uint256) {
        require(x > 0, "LMSR: ln(0)");
        // shift x into [0.5, 2] range to improve convergence
        uint256 result = 0;
        while (x >= 2 * SCALE) {
            x /= 2;
            result += 693147180559945309; // ln(2) * SCALE
        }
        while (x < SCALE / 2) {
            x *= 2;
            result -= 693147180559945309;
        }
        // atanh series: z + z^3/3 + z^5/5 + ...  where z = (x-1)/(x+1)
        uint256 xp1 = x + SCALE;
        uint256 xm1 = x > SCALE ? x - SCALE : SCALE - x;
        bool neg = x < SCALE;
        uint256 z = xm1 * SCALE / xp1;
        uint256 zz = z * z / SCALE;
        uint256 term = z;
        uint256 series = term;
        for (uint256 i = 3; i <= 35; i += 2) {
            term = term * zz / SCALE;
            series += term / i;
            if (term / i < 1) break;
        }
        series *= 2;
        if (neg) {
            result = result - series;
        } else {
            result = result + series;
        }
        return result;
    }
}
