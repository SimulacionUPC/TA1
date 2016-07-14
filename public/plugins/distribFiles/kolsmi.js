this.kolsmi = (function() {
    var k = {};
    var KScale;

    k.DoKolIQ = function (n, alfa) {
        // TODO: investigate why we have to use the half of alfa
        alfa = alfa / 2;
        var n = PosV(parseInt(n));
        KScale = 1;
        var pq = parseFloat(alfa);
        alfa = Fixed(pq, 10, 4);
        var t = InvKolSmir(n, pq);
        return Fixed(t, 10, 4);
    }

    function PosV(x) {
        if (x < 0) x = -x;
        return x;
    }

    function InvKolSmir(n, p) {
        // NOTE: needs p;  returns e = Dn+ or Dn-
        // n = degfree 1..inf; p = pct level 0..1
        // D statistic for a given probability
        // Miller, L.  1956.  Journal of the American Statistical
        //    Association.  51: 111-121.  (11)
        var a = 1 - p;
        var q, r, s, t, u, v, w, z;

        var log10a = Math.log(a) / Math.LN10;
        q = 0.09037 * Math.exp(Math.log(-log10a) * 1.5);
        r = 0.01515 * log10a * log10a;
        s = (0.08467 * a) + 0.11143;
        t = q + r - s;
        u = InvKolSmirC(n, a);
        v = 0.16693 / n;
        w = t * Math.exp(-1.5 * Math.log(n));

        var z = u - v - w;

        var acc = 0.01;
        if (n < 2) acc = 0.1;
        if (n < 100) {
            t = InvKolSmirD(n, a, z, acc);
            if (t > -1)
                z = t;
        }

        if (z > 1) z = 1;
        if (z < 0) z = 0;
        return z * KScale; // Kn support
    }

    function Fixed(s, wid, dec) {
        // many combinations of possibilities

        // maybe prepare for upcoming truncate
        var z = 1
        if (dec > 0) {
            z /= Math.pow(10, dec);
            if (s < -z) s -= 0.5 * z;
            else
            if (s > z) s += 0.5 * z;
            else
                s = 0;
        }

        // assure a string
        s = "" + s;

        // chop neg, if any
        var neg = 0;
        if (s.charAt(0) == "-") {
            neg = 2;
            s = s.substring(1, s.length);
        }

        // chop exponent, if any
        var exp = "";
        var e = s.lastIndexOf("E");
        if (e < 0) e = s.lastIndexOf("e");
        if (e > -1) {
            exp = s.substring(e, s.length);
            s = s.substring(0, e);
        }

        // if dec > 0 assure "."; dp == index of "."
        var dp = s.indexOf(".", 0);
        if (dp == -1) {
            dp = s.length;
            if (dec > 0) {
                s += ".";
                dp = s.length - 1;
            }
        }

        // assure leading digit
        if (dp == 0) {
            s = '0' + s;
            dp = 1;
        }

        // not enough dec pl?  add 0's
        while ((dec > 0) && ((s.length - dp - 1) < dec))
            s += "0";

        // too many dec pl?  take a substring
        var places = s.length - dp - 1;
        if (places > dec) {
            if (dec == 0) {
                s = s.substring(0, dp);
            } else {
                s = s.substring(0, dp + dec + 1);
            }
        }

        // recover exponent, if any
        s += exp;

        // recover neg, if any
        if (neg > 0)
            s = "-" + s;

        // if not enough width, add spaces IN FRONT
        //    too many places?  tough!
        while (s.length < wid)
            s = " " + s;

        return s
    }

    function InvKolSmir(n, p) {
        // NOTE: needs p;  returns e = Dn+ or Dn-
        // n = degfree 1..inf; p = pct level 0..1
        // D statistic for a given probability
        // Miller, L.  1956.  Journal of the American Statistical
        //    Association.  51: 111-121.  (11)
        var a = 1 - p;
        var q, r, s, t, u, v, w, z;

        var log10a = Math.log(a) / Math.LN10;
        q = 0.09037 * Math.exp(Math.log(-log10a) * 1.5);
        r = 0.01515 * log10a * log10a;
        s = (0.08467 * a) + 0.11143;
        t = q + r - s;
        u = InvKolSmirC(n, a);
        v = 0.16693 / n;
        w = t * Math.exp(-1.5 * Math.log(n));

        var z = u - v - w;

        var acc = 0.01;
        if (n < 2) acc = 0.1;
        if (n < 100) {
            t = InvKolSmirD(n, a, z, acc);
            if (t > -1)
                z = t;
        }

        if (z > 1) z = 1;
        if (z < 0) z = 0;
        return z * KScale; // Kn support
    }

    function InvKolSmirC(n, p) {
        // returns e = Dn+ or Dn-
        // n = degfree 1..inf; a = pct level 0..1
        // D statistic for a given probability
        //    the original formula by Smirnov
        // Miller, L.  1956.  Journal of the American Statistical
        //    Association.  51: 111-121.  (3)
        var a = 1 - p;
        var q = Math.log(1 / a);
        var r = q / (2 * n);
        return Math.sqrt(r);
    }

    function InvKolSmirD(n, p, guess, acc) {
        // find e such that f(e) ~= p

        // basic range protection
        if (p < 0) p = 0;
        else
        if (p > 1) p = 1;
        if (n < 0) n = 0;
        if (guess < 0) guess = 0;

        var loopct = 0,
            c;

        var a = guess,
            b = guess;
        if (a < 0) a = 0.001;
        var fc = KolSmirP(n, a);
        //alert( "first guess, a: " + Fixed(a,10,6) + "  fa: " + Fixed(fc,10,6)  + "  p: " + Fixed(p,10,6) );

        if (fc >= p) {
            // first guess is high, hop a down
            while ((fc >= 0) && (fc >= p) && (loopct++ < 10)) {
                b = a;
                a -= acc;
                if (a < 0) {
                    a = 0;
                    break;
                }
                fc = KolSmirP(n, a);
                //alert( "hopping a down, a: " + Fixed(a,10,6) + "  fa: " + Fixed(fc,10,6) + "  p: " + Fixed(p,10,6) );
                acc *= 2;
            }
        } else {
            // guess is low, hop b up
            while ((fc >= 0) && (fc <= p) && (loopct++ < 10)) {
                a = b;
                b += acc;
                if (b > 1) {
                    b = 1;
                    break;
                }
                fc = KolSmirP(n, b);
                //alert( "hopping b up, b: " + Fixed(b,10,6) + "  fb: " + Fixed(fc,10,6) + "  p: " + Fixed(p,10,6) );
                acc *= 2;
            }
        }

        // x is bracketed by a and b, so squeeze...
        loopct = -loopct;
        while ((fc >= 0) && (Math.abs(fc - p) > 1E-4) && (loopct++ < 20)) {
            c = a + (b - a) / 2; // bisection
            fc = KolSmirP(n, c);
            //alert( "sqeezing, a: " + Fixed(a,10,6) + "  b: " + Fixed(b,10,6) + "  c: " + Fixed(c,10,6) + "  fc: " + Fixed(fc,10,6) + "  p: " + Fixed(p,10,6) );
            if (fc < p) a = c;
            else b = c;
        }

        if ((fc < 0) || (loopct >= 20)) return -2;
        else return c;
    }

    function InvKolSmirC(n, p) {
        // returns e = Dn+ or Dn-
        // n = degfree 1..inf; a = pct level 0..1
        // D statistic for a given probability
        //    the original formula by Smirnov
        // Miller, L.  1956.  Journal of the American Statistical
        //    Association.  51: 111-121.  (3)
        var a = 1 - p;
        var q = Math.log(1 / a);
        var r = q / (2 * n);
        return Math.sqrt(r);
    }

    function KolSmirP(n, e) {
        // NOTE: needs e = Dn+ or Dn-; returns p = 1-a
        // Miller, L.  1956.  Journal of the American Statistical
        //    Association.  51: 111-121.  (2)
        var j, jdn, q, r, s, t;

        var las = Math.floor(n - n * e);

        var sum = 0;
        for (j = 0; j <= las; j++) {
            jdn = j / n;
            q = LnComb(n, j);
            r = (n - j) * Math.log(1 - e - jdn);
            s = (j - 1) * Math.log(e + jdn);
            t = Math.exp(q + r + s);
            sum += t;
        }

        return 1 - (e * sum);
    }

    function LnComb(n, k) {
        if ((k == 0) || (k == n)) return 0;
        else
        if ((k > n) || (k < 0)) return -1E38;
        else
            return (LnFact(n) - LnFact(k) - LnFact(n - k));
    }

    function LnFact(x) {
        // ln(x!) by Stirling's formula
        //   see Knuth I: 111
        if (x <= 1) x = 1;

        if (x < 12)
            return Math.log(Fact(Math.round(x)));
        else {
            var invx = 1 / x;
            var invx2 = invx * invx;
            var invx3 = invx2 * invx;
            var invx5 = invx3 * invx2;
            var invx7 = invx5 * invx2;

            var sum = ((x + 0.5) * Math.log(x)) - x;
            sum += Math.log(2 * Math.PI) / 2;
            sum += (invx / 12) - (invx3 / 360);
            sum += (invx5 / 1260) - (invx7 / 1680);

            return sum;
        }
    }

    function Fact(x) {
        // x factorial
        var t = 1;
        while (x > 1)
            t *= x--;
        return t;
    }

    return k;
})();