import re

# =====================================================
# PREPROCESSING
# =====================================================
def preprocess_input(text):
    """
    Normalisasi input string agar sesuai alfabet Σ
    """
    text = text.lower().strip()
    return text


# =====================================================
# DFA 1: KEYWORD PHISHING DETECTOR
# Bahasa:
# L_keyword = Σ* (login | verify | update | secure | account | confirm) Σ*
# =====================================================
def dfa_keyword_phishing(text):
    phishing_keywords = [
        "login",
        "verify",
        "update",
        "secure",
        "account",
        "confirm"
    ]

    for keyword in phishing_keywords:
        state = 0
        for char in text:
            if char == keyword[state]:
                state += 1
                if state == len(keyword):
                    return True, keyword
            else:
                state = 0

    return False, None


# =====================================================
# DFA 2: STRUCTURE-BASED PHISHING DETECTOR
# =====================================================
def dfa_structure_phishing(text):
    reasons = []

    # DFA: HTTP tanpa HTTPS
    if text.startswith("http://"):
        reasons.append("Menggunakan HTTP (tidak terenkripsi)")

    # DFA: Domain berupa IP address
    ip_pattern = r"http[s]?://\d+\.\d+\.\d+\.\d+"
    if re.match(ip_pattern, text):
        reasons.append("Domain menggunakan IP address")

    # DFA: Karakter redirect '@'
    if "@" in text:
        reasons.append("Mengandung karakter redirect '@'")

    # DFA: Subdomain berlebihan
    if text.count(".") > 4:
        reasons.append("Jumlah subdomain berlebihan")

    return reasons


# =====================================================
# DFA 3: SMS PHISHING DETECTOR
# Bahasa:
# L_sms = Σ* (klik | hadiah | otp | verifikasi | menang) Σ*
# =====================================================
def dfa_sms_phishing(text):
    sms_keywords = [
        "klik",
        "hadiah",
        "otp",
        "verifikasi",
        "menang",
        "gratis"
    ]

    for keyword in sms_keywords:
        state = 0
        for char in text:
            if char == keyword[state]:
                state += 1
                if state == len(keyword):
                    return True, keyword
            else:
                state = 0

    return False, None


# =====================================================
# DECISION ENGINE
# =====================================================
def phishing_checker(user_input):
    text = preprocess_input(user_input)

    keyword_detected, keyword = dfa_keyword_phishing(text)
    sms_detected, sms_keyword = dfa_sms_phishing(text)
    structure_issues = dfa_structure_phishing(text)

    if keyword_detected or sms_detected or structure_issues:
        return {
            "status": "PHISHING",
            "keyword": keyword,
            "sms_keyword": sms_keyword,
            "structure_issues": structure_issues
        }
    else:
        return {
            "status": "AMAN",
            "message": "Tidak ditemukan pola phishing"
        }


# =====================================================
# MAIN PROGRAM
# =====================================================
def main():
    print("ANTI-PHISHING LINK & SMS CHECKER")
    print("Berbasis Teori Bahasa & Otomata (Finite Automata)")
    print("-" * 50)

    user_input = input("Masukkan link atau SMS mencurigakan:\n> ")
    result = phishing_checker(user_input)

    print("\nHASIL ANALISIS")
    print("-" * 50)

    if result["status"] == "PHISHING":
        print("STATUS : PHISHING TERDETEKSI")

        if result["keyword"]:
            print(f"- Keyword phishing (URL) : {result['keyword']}")

        if result["sms_keyword"]:
            print(f"- Keyword phishing (SMS) : {result['sms_keyword']}")

        for issue in result["structure_issues"]:
            print(f"- Struktur mencurigakan : {issue}")

        print("\nKesimpulan:")
        print("String input termasuk dalam bahasa phishing (L_p)")
    else:
        print("STATUS : AMAN")
        print(result["message"])
        print("\nKesimpulan:")
        print("String input termasuk dalam bahasa aman (L_a)")


# =====================================================
# ENTRY POINT
# =====================================================
if __name__ == "__main__":
    main()