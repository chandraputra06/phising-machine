import re
import customtkinter as ctk

# =========================
# BRAND / THEME
# =========================
APP_NAME = "SIPANDA"
APP_TAGLINE = "Sistem Identifikasi Penipuan Digital (DFA)"
PRIMARY = "#B2AC88"
PRIMARY_DARK = "#9D976F"
BG = "#0B1220"
CARD = "#121A2B"
BORDER = "#24304A"
TEXT_MUTED = "#B7C0D1"
RADIUS = 25

FONT_FAMILY = "Poppins"  # pastikan ter-install di OS

def F(size: int, bold: bool = False):
    return ctk.CTkFont(family=FONT_FAMILY, size=size, weight=("bold" if bold else "normal"))

# =========================
# LOGIC (dari fp.py)
# =========================
def preprocess_input(text: str) -> str:
    return (text or "").lower().strip()

def dfa_keyword_phishing(text: str):
    phishing_keywords = ["login", "verify", "update", "secure", "account", "confirm"]
    for keyword in phishing_keywords:
        state = 0
        for ch in text:
            if state < len(keyword) and ch == keyword[state]:
                state += 1
                if state == len(keyword):
                    return True, keyword
            else:
                state = 0
    return False, None

def dfa_structure_phishing(text: str):
    reasons = []
    if text.startswith("http://"):
        reasons.append("Menggunakan HTTP (tidak terenkripsi)")

    ip_pattern = r"http[s]?://\d+\.\d+\.\d+\.\d+"
    if re.match(ip_pattern, text):
        reasons.append("Domain menggunakan IP address")

    if "@" in text:
        reasons.append("Mengandung karakter redirect '@'")

    if text.count(".") > 4:
        reasons.append("Jumlah subdomain berlebihan")

    return reasons

def dfa_sms_phishing(text: str):
    sms_keywords = ["klik", "hadiah", "otp", "verifikasi", "menang", "gratis"]
    for keyword in sms_keywords:
        state = 0
        for ch in text:
            if state < len(keyword) and ch == keyword[state]:
                state += 1
                if state == len(keyword):
                    return True, keyword
            else:
                state = 0
    return False, None

def phishing_checker(user_input: str):
    text = preprocess_input(user_input)
    kw_detected, kw = dfa_keyword_phishing(text)
    sms_detected, sms_kw = dfa_sms_phishing(text)
    issues = dfa_structure_phishing(text)

    if kw_detected or sms_detected or issues:
        return {
            "status": "PHISHING",
            "keyword": kw,
            "sms_keyword": sms_kw,
            "structure_issues": issues,
        }
    return {"status": "AMAN", "message": "Tidak ditemukan pola phishing"}

# =========================
# UI (CustomTkinter)
# =========================
class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        ctk.set_appearance_mode("dark")

        self.title(f"{APP_NAME} — Anti Scam URL & SMS")
        self.geometry("1050x620")
        self.minsize(920, 540)
        self.configure(fg_color=BG)

        root = ctk.CTkFrame(self, fg_color="transparent")
        root.pack(fill="both", expand=True, padx=18, pady=18)

        # Header (tanpa logo & tanpa theme toggle)
        ctk.CTkLabel(root, text=APP_NAME, font=F(26, bold=True)).pack(anchor="w")
        ctk.CTkLabel(root, text=APP_TAGLINE, font=F(12, bold=False), text_color=TEXT_MUTED)\
            .pack(anchor="w", pady=(0, 14))

        content = ctk.CTkFrame(root, fg_color="transparent")
        content.pack(fill="both", expand=True)
        content.grid_columnconfigure(0, weight=3)
        content.grid_columnconfigure(1, weight=2)
        content.grid_rowconfigure(0, weight=1)

        # Left: Input
        left = ctk.CTkFrame(content, fg_color=CARD, corner_radius=RADIUS,
                            border_color=BORDER, border_width=1)
        left.grid(row=0, column=0, sticky="nsew", padx=(0, 12))

        ctk.CTkLabel(left, text="Masukkan tautan / pesan mencurigakan",
                     font=F(14, bold=True)).pack(anchor="w", padx=18, pady=(16, 2))
        ctk.CTkLabel(left, text="Tempel URL atau teks SMS, lalu klik Cek.",
                     font=F(12), text_color=TEXT_MUTED).pack(anchor="w", padx=18, pady=(0, 10))

        self.input = ctk.CTkTextbox(
            left, height=240, corner_radius=RADIUS,
            fg_color="#0F172A", border_color=BORDER, border_width=1,
            text_color="#EAF0FF", font=F(12)
        )
        self.input.pack(fill="both", expand=True, padx=18, pady=(0, 10))
        self.input.insert("1.0",
            "Contoh:\n"
            "- http://192.168.1.10/login\n"
            "- Anda MENANG hadiah besar! klik link ini untuk verifikasi OTP sekarang"
        )

        # Chips (contoh cepat)
        chips = ctk.CTkFrame(left, fg_color="transparent")
        chips.pack(fill="x", padx=18, pady=(0, 10))

        def chip(text, fill):
            return ctk.CTkButton(
                chips, text=text, height=34,
                fg_color="transparent", hover_color="#0F182A",
                border_color=BORDER, border_width=1,
                corner_radius=999,
                font=F(11),
                command=lambda: self.fill_input(fill)
            )

        chip("URL: verify-account", "http://example.com/verify-account").pack(side="left", padx=(0, 8))
        chip("URL: IP + login", "http://192.168.1.10/login").pack(side="left", padx=(0, 8))
        chip("URL: redirect '@'", "http://secure.example.com@evil.com/update").pack(side="left", padx=(0, 8))

        chips2 = ctk.CTkFrame(left, fg_color="transparent")
        chips2.pack(fill="x", padx=18, pady=(0, 14))
        ctk.CTkButton(
            chips2, text="SMS: hadiah + klik + otp", height=34,
            fg_color="transparent", hover_color="#0F182A",
            border_color=BORDER, border_width=1,
            corner_radius=999,
            font=F(11),
            command=lambda: self.fill_input("Anda MENANG hadiah besar! klik link ini untuk verifikasi OTP sekarang")
        ).pack(side="left")

        # Buttons
        actions = ctk.CTkFrame(left, fg_color="transparent")
        actions.pack(fill="x", padx=18, pady=(0, 18))

        ctk.CTkButton(
            actions, text="Reset", height=40,
            fg_color="transparent", hover_color="#0F182A",
            border_color=BORDER, border_width=1,
            corner_radius=RADIUS,
            font=F(13, bold=True),
            command=self.reset
        ).pack(side="left")

        ctk.CTkButton(
            actions, text="Cek Sekarang", height=40,
            fg_color=PRIMARY, hover_color=PRIMARY_DARK,
            text_color="#121212",
            corner_radius=RADIUS,
            font=F(13, bold=True),
            command=self.check
        ).pack(side="left", padx=10)

        # Right: Result
        right = ctk.CTkFrame(content, fg_color=CARD, corner_radius=RADIUS,
                             border_color=BORDER, border_width=1)
        right.grid(row=0, column=1, sticky="nsew")

        top = ctk.CTkFrame(right, fg_color="transparent")
        top.pack(fill="x", padx=18, pady=(16, 8))

        ctk.CTkLabel(top, text="Hasil Analisis", font=F(14, bold=True)).pack(side="left")
        self.badge = ctk.CTkLabel(top, text="—", text_color=TEXT_MUTED, font=F(12, bold=True))
        self.badge.pack(side="right")

        self.output = ctk.CTkTextbox(
            right, corner_radius=RADIUS,
            fg_color="#0F172A", border_color=BORDER, border_width=1,
            text_color="#EAF0FF", font=F(12)
        )
        self.output.pack(fill="both", expand=True, padx=18, pady=(0, 18))
        self.set_output("Masukkan teks lalu klik 'Cek Sekarang'.")

    def fill_input(self, text: str):
        self.input.delete("1.0", "end")
        self.input.insert("1.0", text)
        self.input.focus()

    def reset(self):
        self.input.delete("1.0", "end")
        self.badge.configure(text="—", text_color=TEXT_MUTED)
        self.set_output("Masukkan teks lalu klik 'Cek Sekarang'.")

    def set_output(self, text: str):
        self.output.delete("1.0", "end")
        self.output.insert("1.0", text)

    def check(self):
        user_text = self.input.get("1.0", "end").strip()
        if not user_text:
            self.badge.configure(text="Input kosong", text_color="#FCA5A5")
            self.set_output("Input masih kosong. Silakan isi dulu.")
            return

        res = phishing_checker(user_text)

        if res["status"] == "PHISHING":
            self.badge.configure(text="🚨 SCAM TERDETEKSI", text_color="#FCA5A5")
            lines = ["STATUS: SCAM / PHISHING TERDETEKSI\n"]

            if res["keyword"]:
                lines.append(f"- Keyword (URL): {res['keyword']}")
            if res["sms_keyword"]:
                lines.append(f"- Keyword (SMS): {res['sms_keyword']}")
            for issue in res["structure_issues"]:
                lines.append(f"- Struktur mencurigakan: {issue}")

            lines.append("\nKesimpulan: String input termasuk bahasa phishing (L_p).")
            self.set_output("\n".join(lines))
        else:
            self.badge.configure(text="✅ AMAN", text_color="#86EFAC")
            self.set_output(
                "STATUS: AMAN\n"
                f"{res['message']}\n\n"
                "Kesimpulan: String input termasuk bahasa aman (L_a)."
            )

if __name__ == "__main__":
    App().mainloop()
