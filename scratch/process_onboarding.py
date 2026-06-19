import re

with open('/Users/user/Documents/pal-frontend/scratch/OnboardingScreen_orig.tsx', 'r') as f:
    code = f.read()

# 1. Update supabaseAnonKey in handleSocialSignIn
orig_key_def = '    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;'
new_key_def = '    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;'
code = code.replace(orig_key_def, new_key_def)

# 2. Update SignupScreen redirection logic
orig_signup_redirect = '''        localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
        onNext();'''
new_signup_redirect = '''        localStorage.setItem("pal_user_profile", JSON.stringify(profilePayload));
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        const useSupabase = supabaseUrl && supabaseAnonKey && 
                            !supabaseUrl.includes("dummy-url") && 
                            !supabaseAnonKey.includes("dummy-key");
                            
        if (useSupabase) {
          router.push("/");
        } else {
          onNext();
        }'''
code = code.replace(orig_signup_redirect, new_signup_redirect)

# 3. Enforce text-[16px] in AuthField inputs to prevent iOS auto-zoom
orig_auth_input = '            "auth-input bg-[var(--app-input-bg)] border-[var(--app-input-border)] text-[var(--app-text)]",'
new_auth_input = '            "auth-input text-[16px] bg-[var(--app-input-bg)] border-[var(--app-input-border)] text-[var(--app-text)]",'
code = code.replace(orig_auth_input, new_auth_input)

# 4. Update OtpScreen environment config
orig_otp_anon_key = '''    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;'''
new_otp_anon_key = '''    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;'''
code = code.replace(orig_otp_anon_key, new_otp_anon_key)

# 5. Update OtpScreen verification logic to support local endpoint
orig_otp_verify = '''    if (useSupabase) {
      const { data, error: err } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup"
      });
      if (err) {
        setError(true);
        console.error("OTP verification error:", err.message);
      } else {
        setSuccess(true);
      }
    } else {
      if (code === "11111") {
        setSuccess(true);
        return;
      }
      setError(true);
    }'''
new_otp_verify = '''    if (useSupabase) {
      const { data, error: err } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup"
      });
      if (err) {
        setError(true);
        console.error("OTP verification error:", err.message);
      } else {
        // Sync local profile metadata
        try {
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: localStorage.getItem("pal_user_profile") ? JSON.parse(localStorage.getItem("pal_user_profile") || "{}").fullName : "New User",
              email
            })
          });
        } catch (e) {
          console.error("Sync profile error:", e);
        }
        setSuccess(true);
      }
    } else {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        });
        if (res.ok) {
          setSuccess(true);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Local verification error:", err);
        setError(true);
      }
    }'''
code = code.replace(orig_otp_verify, new_otp_verify)

# 6. Make screen components scroll-adaptable (min-h wrapper & overflow-y-auto on outer div)

# GrowthIntro
orig_growth = '''function GrowthIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-hidden px-[34px] pt-[32px] flex flex-col">
      <ProgressBars active={0} />
      <h1 className="mt-[33px] text-[65px] font-semibold leading-[0.94] text-left" style={{ color: \'var(--app-accent)\' }}>
        GO FOR
        <br />
        BUSINESS
        <br />
        GROWTH
        <br />
        <span style={{ color: \'var(--onb-heading)\' }} className="font-bold">WITH</span>
        <br />
        <span style={{ color: \'var(--onb-heading)\' }} className="font-bold">PAL</span>
      </h1>
      <Mascot priority className="absolute -right-[266px] bottom-[-52px] w-[496px] max-w-none" />
      <button
        type="button"
        onClick={onNext}
        className="absolute bottom-[42px] left-[34px] z-20 rounded-[15px] bg-white border border-gray-150 px-[20px] py-[14px] text-left text-[17px] font-semibold leading-[1.25] text-black shadow-lg cursor-pointer transition-transform active:scale-[0.98]"
      >
        It&apos;s more fun and quick
        <br />
        when we do it together!
      </button>
    </div>
  );
}'''
new_growth = '''function GrowthIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[32px]">
      <div className="min-h-[650px] w-full h-full relative flex flex-col">
        <ProgressBars active={0} />
        <h1 className="mt-[33px] text-[65px] font-semibold leading-[0.94] text-left" style={{ color: \'var(--app-accent)\' }}>
          GO FOR
          <br />
          BUSINESS
          <br />
          GROWTH
          <br />
          <span style={{ color: \'var(--onb-heading)\' }} className="font-bold">WITH</span>
          <br />
          <span style={{ color: \'var(--onb-heading)\' }} className="font-bold">PAL</span>
        </h1>
        <Mascot priority className="absolute -right-[266px] bottom-[-52px] w-[496px] max-w-none" />
        <button
          type="button"
          onClick={onNext}
          className="absolute bottom-[42px] left-[34px] z-20 rounded-[15px] bg-white border border-gray-150 px-[20px] py-[14px] text-left text-[17px] font-semibold leading-[1.25] text-black shadow-lg cursor-pointer transition-transform active:scale-[0.98]"
        >
          It&apos;s more fun and quick
          <br />
          when we do it together!
        </button>
      </div>
    </div>
  );
}'''
code = code.replace(orig_growth, new_growth)

# ManageIntro
orig_manage = '''function ManageIntro({ onNext }: { onNext: () => void }) {
  return (
    <button
      type="button"
      onClick={onNext}
      className="relative flex h-[calc(100%_-_58px)] w-full flex-col items-start overflow-hidden px-[34px] pt-[32px] text-left cursor-pointer border-0 outline-none"
      aria-label="Continue onboarding"
    >
      <ProgressBars active={1} />
      <BrandLogo className="mt-[48px] h-auto w-[168px] ml-[34px]" />
      <h1 className="mt-[7px] text-[58px] font-semibold leading-[0.96] text-left ml-[34px]" style={{ color: \'var(--onb-heading)\' }}>
        Tracks
        <br />
        Manage
        <br />
        &amp; Grow
        <br />
        <span style={{ color: \'var(--onb-heading)\' }} className="font-bold">All In One</span>
        <br />
        <span style={{ color: \'var(--onb-heading)\' }} className="font-bold">Place.</span>
      </h1>
      <Mascot priority className="absolute -right-[250px] bottom-[-270px] w-[600px] max-w-none" />
    </button>
  );
}'''
new_manage = '''function ManageIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[32px]">
      <button
        type="button"
        onClick={onNext}
        className="flex flex-col w-full h-full min-h-[650px] items-start overflow-hidden text-left cursor-pointer border-0 outline-none relative"
        aria-label="Continue onboarding"
      >
        <ProgressBars active={1} />
        <BrandLogo className="mt-[48px] h-auto w-[168px] ml-[34px]" />
        <h1 className="mt-[7px] text-[58px] font-semibold leading-[0.96] text-left ml-[34px]" style={{ color: \'var(--onb-heading)\' }}>
          Tracks
          <br />
          Manage
          <br />
          &amp; Grow
          <br />
          <span style={{ color: \'var(--onb-heading)\' }} className="font-bold">All In One</span>
          <br />
          <span style={{ color: \'var(--onb-heading)\' }} className="font-bold">Place.</span>
        </h1>
        <Mascot priority className="absolute -right-[250px] bottom-[-270px] w-[600px] max-w-none" />
      </button>
    </div>
  );
}'''
code = code.replace(orig_manage, new_manage)

# TogetherIntro
orig_together = '''function TogetherIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative h-[calc(100%_-_58px)] px-[34px] pt-[32px]">
      <ProgressBars active={2} />
      <div className="pal-card-stack relative mt-[82px] rounded-[31px] bg-white px-[38px] pb-[31px] pt-[30px] shadow-pal text-left">
        <ul className="relative z-10 list-disc space-y-[22px] pl-[18px] text-[17px] leading-[1.25] marker:text-[#3b5a7c]" style={{ color: \'#3b5a7c\' }}>
          <li>
            <span className="font-semibold text-[#0a438a]">Log sales, expenses,</span> and project updates
            effortlessly. PAL remembers everything so you can focus on what matters.
          </li>
          <li>
            <span className="font-semibold text-[#0a438a]">Get daily insights on profit,</span> spending, and growth.
            PAL breaks it down in simple terms just for you.
          </li>
          <li>
            <span className="font-semibold text-[#0a438a]">Tech? Retail? Services?</span>
            <br />
            PAL adapts to your hustle, your flow, your way.
          </li>
          <li>
            You don&apos;t have to do it alone anymore.
            <br />
            <span className="font-semibold text-[#0a438a]">PAL is with you. Let&apos;s go 🚀</span>
          </li>
        </ul>
        <Mascot className="absolute -bottom-[83px] left-[118px] z-20 w-[96px]" />
      </div>
      <button
        type="button"
        onClick={onNext}
        className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer"
      >
        Let&apos;s go 🚀
      </button>
    </div>
  );
}'''
new_together = '''function TogetherIntro({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[32px]">
      <div className="min-h-[620px] w-full h-full relative flex flex-col">
        <ProgressBars active={2} />
        <div className="pal-card-stack relative mt-[82px] rounded-[31px] bg-white px-[38px] pb-[31px] pt-[30px] shadow-pal text-left">
          <ul className="relative z-10 list-disc space-y-[22px] pl-[18px] text-[17px] leading-[1.25] marker:text-[#3b5a7c]" style={{ color: \'#3b5a7c\' }}>
            <li>
              <span className="font-semibold text-[#0a438a]">Log sales, expenses,</span> and project updates
              effortlessly. PAL remembers everything so you can focus on what matters.
            </li>
            <li>
              <span className="font-semibold text-[#0a438a]">Get daily insights on profit,</span> spending, and growth.
              PAL breaks it down in simple terms just for you.
            </li>
            <li>
              <span className="font-semibold text-[#0a438a]">Tech? Retail? Services?</span>
              <br />
              PAL adapts to your hustle, your flow, your way.
            </li>
            <li>
              You don&apos;t have to do it alone anymore.
              <br />
              <span className="font-semibold text-[#0a438a]">PAL is with you. Let&apos;s go 🚀</span>
            </li>
          </ul>
          <Mascot className="absolute -bottom-[83px] left-[118px] z-20 w-[96px]" />
        </div>
        <button
          type="button"
          onClick={onNext}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer"
        >
          Let&apos;s go 🚀
        </button>
      </div>
    </div>
  );
}'''
code = code.replace(orig_together, new_together)

# PersonaScreen
orig_persona = '''function PersonaScreen({
  value,
  onChange,
  onNext
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  const options = ["🚀 Startup or Big brand", "🎨 Freelancer / Creative", "🛍️ Business Owner", "🧩 Or others"];

  return (
    <div className="relative h-[calc(100%_-_58px)] px-[34px] pt-[8px] text-left">
      <p className="text-[23px] font-semibold leading-none" style={{ color: \'var(--onb-subtext)\' }}>Hey welcome!</p>
      <h1 className="mt-[12px] text-[30px] font-extrabold leading-[1.12]" style={{ color: \'var(--onb-heading)\' }}>
        Tell us who you are?
      </h1>
      <div className="pal-card-stack relative mt-[61px] rounded-[31px] bg-white px-[29px] pb-[31px] pt-[31px] shadow-pal" style={{ color: \'#111827\' }}>
        <div className="relative z-10 grid grid-cols-1 gap-[16px]">
          {options.map((option) => {
            const cleanVal = option.replace(/^[^ ]+ /, "");
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(cleanVal)}
                className={cn(
                  "h-[85px] rounded-[16px] text-[16px] font-bold transition cursor-pointer border"
                )}
                style={{
                  backgroundColor: value === cleanVal ? \'#000000\' : \'#f3f4f6\',
                  color: value === cleanVal ? \'#ffffff\' : \'#111827\',
                  borderColor: value === cleanVal ? \'#000000\' : \'#d1d5db\'
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
        <Mascot className="absolute -bottom-[68px] left-[119px] z-20 w-[97px]" />
      </div>
      <button 
        type="button" 
        onClick={onNext} 
        disabled={!value}
        className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}'''
new_persona = '''function PersonaScreen({
  value,
  onChange,
  onNext
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  const options = ["🚀 Startup or Big brand", "🎨 Freelancer / Creative", "🛍️ Business Owner", "🧩 Or others"];

  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[8px]">
      <div className="min-h-[620px] w-full h-full relative flex flex-col text-left">
        <p className="text-[23px] font-semibold leading-none" style={{ color: \'var(--onb-subtext)\' }}>Hey welcome!</p>
        <h1 className="mt-[12px] text-[30px] font-extrabold leading-[1.12]" style={{ color: \'var(--onb-heading)\' }}>
          Tell us who you are?
        </h1>
        <div className="pal-card-stack relative mt-[61px] rounded-[31px] bg-white px-[29px] pb-[31px] pt-[31px] shadow-pal" style={{ color: \'#111827\' }}>
          <div className="relative z-10 grid grid-cols-1 gap-[16px]">
            {options.map((option) => {
              const cleanVal = option.replace(/^[^ ]+ /, "");
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange(cleanVal)}
                  className={cn(
                    "h-[85px] rounded-[16px] text-[16px] font-bold transition cursor-pointer border"
                  )}
                  style={{
                    backgroundColor: value === cleanVal ? \'#000000\' : \'#f3f4f6\',
                    color: value === cleanVal ? \'#ffffff\' : \'#111827\',
                    borderColor: value === cleanVal ? \'#000000\' : \'#d1d5db\'
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <Mascot className="absolute -bottom-[68px] left-[119px] z-20 w-[97px]" />
        </div>
        <button 
          type="button" 
          onClick={onNext} 
          disabled={!value}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}'''
code = code.replace(orig_persona, new_persona)

# IndustryScreen
orig_industry = '''function IndustryScreen({
  value,
  onChange,
  onNext
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="relative h-[calc(100%_-_58px)] px-[34px] pt-[8px] text-left">
      <h1 className="text-[36px] font-extrabold leading-[1.05]" style={{ color: \'var(--onb-heading)\' }}>
        Choose your Industry
      </h1>
      <p className="mt-[6px] max-w-[340px] text-[18px] font-medium leading-[1.25]" style={{ color: \'var(--onb-subtext)\' }}>
        Please choose your profession from the list below.
      </p>
      <div className="mt-[25px] grid grid-cols-2 gap-[12px] w-full">
        {industries.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(label)}
            className={cn(
              "flex flex-col items-center justify-center gap-[8px] rounded-[16px] border p-[12px] text-center text-[13px] font-bold transition cursor-pointer shadow-sm"
            )}
            style={{
              backgroundColor: value === label ? \'var(--app-accent)\' : \'var(--app-card-alt)\',
              borderColor: value === label ? \'var(--app-accent)\' : \'var(--app-card-border)\',
              color: value === label ? \'#ffffff\' : \'var(--app-text-secondary)\',
              textAlign: \'center\',
              height: \'100px\'
            }}
          >
            <Icon 
              size={22} 
              style={{ color: value === label ? \'#ffffff\' : \'var(--app-text-secondary)\' }}
              strokeWidth={2.2} 
            />
            <span className="leading-tight">{label}</span>
          </button>
        ))}
      </div>
      <button 
        type="button" 
        onClick={onNext} 
        disabled={!value}
        className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}'''
new_industry = '''function IndustryScreen({
  value,
  onChange,
  onNext
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[8px]">
      <div className="min-h-[580px] w-full h-full relative flex flex-col text-left">
        <h1 className="text-[36px] font-extrabold leading-[1.05]" style={{ color: \'var(--onb-heading)\' }}>
          Choose your Industry
        </h1>
        <p className="mt-[6px] max-w-[340px] text-[18px] font-medium leading-[1.25]" style={{ color: \'var(--onb-subtext)\' }}>
          Please choose your profession from the list below.
        </p>
        <div className="mt-[25px] grid grid-cols-2 gap-[12px] w-full">
          {industries.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange(label)}
              className={cn(
                "flex flex-col items-center justify-center gap-[8px] rounded-[16px] border p-[12px] text-center text-[13px] font-bold transition cursor-pointer shadow-sm"
              )}
              style={{
                backgroundColor: value === label ? \'var(--app-accent)\' : \'var(--app-card-alt)\',
                borderColor: value === label ? \'var(--app-accent)\' : \'var(--app-card-border)\',
                color: value === label ? \'#ffffff\' : \'var(--app-text-secondary)\',
                textAlign: \'center\',
                height: \'100px\'
              }}
            >
              <Icon 
                size={22} 
                style={{ color: value === label ? \'#ffffff\' : \'var(--app-text-secondary)\' }}
                strokeWidth={2.2} 
              />
              <span className="leading-tight">{label}</span>
            </button>
          ))}
        </div>
        <button 
          type="button" 
          onClick={onNext} 
          disabled={!value}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}'''
code = code.replace(orig_industry, new_industry)

# CountryScreen search input text-[15px] to text-[16px] was already handled, let's replace CountryScreen
orig_country = '''function CountryScreen({
  selected,
  query,
  onQuery,
  onSelect,
  onNext
}: {
  selected: string;
  query: string;
  onQuery: (value: string) => void;
  onSelect: (value: string) => void;
  onNext: () => void;
}) {
  const filtered = useMemo(
    () => countries.filter((country) => country[1].toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="relative h-[calc(100%_-_58px)] px-[34px] pt-[8px] text-left">
      <h1 className="text-[36px] font-extrabold leading-[1.05]" style={{ color: \'var(--onb-heading)\' }}>
        Choose your country
      </h1>
      <p className="mt-[6px] max-w-[350px] text-[18px] font-medium leading-[1.25]" style={{ color: \'var(--onb-subtext)\' }}>
        Please choose your preferred country from the list below.
      </p>
      <section className="mt-[25px] h-[340px] overflow-hidden rounded-[30px] px-[16px] pt-[12px] shadow-pal bg-white border border-gray-100">
        <label className="relative block w-full">
          <span className="sr-only">Search country</span>
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            className="h-[40px] w-full rounded-full border border-gray-300 bg-gray-50 px-[23px] pr-[48px] text-[15px] text-black outline-none placeholder:text-gray-400"
            placeholder="Search here"
          />
          <Search className="absolute right-[20px] top-[9px] text-gray-400" size={22} />
        </label>
        <div className="mt-[16px] h-[250px] overflow-y-auto pb-[20px] pl-[6px] pr-[7px] scrollbar-hide text-black">
          {filtered.map(([flag, name]) => (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(name)}
              className={cn(
                "flex h-[43px] w-full items-center justify-between rounded-[8px] text-[15px] cursor-pointer px-3 transition-colors",
                selected === name 
                  ? "bg-[var(--app-accent-soft)] font-bold" 
                  : "hover:bg-gray-100"
              )}
              style={{ textAlign: \'left\', color: selected === name ? \'var(--app-accent)\' : \'#1f2937\' }}
            >
              <div className="flex items-center gap-[20px]">
                <span className="text-[29px] leading-none">{flag}</span>
                <span>{name}</span>
              </div>
              {selected === name && <Check size={18} className="text-[var(--app-accent)]" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </section>
      <button 
        type="button" 
        onClick={onNext} 
        disabled={!selected}
        className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}'''
new_country = '''function CountryScreen({
  selected,
  query,
  onQuery,
  onSelect,
  onNext
}: {
  selected: string;
  query: string;
  onQuery: (value: string) => void;
  onSelect: (value: string) => void;
  onNext: () => void;
}) {
  const filtered = useMemo(
    () => countries.filter((country) => country[1].toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[8px]">
      <div className="min-h-[620px] w-full h-full relative flex flex-col text-left">
        <h1 className="text-[36px] font-extrabold leading-[1.05]" style={{ color: \'var(--onb-heading)\' }}>
          Choose your country
        </h1>
        <p className="mt-[6px] max-w-[350px] text-[18px] font-medium leading-[1.25]" style={{ color: \'var(--onb-subtext)\' }}>
          Please choose your preferred country from the list below.
        </p>
        <section className="mt-[25px] h-[340px] overflow-hidden rounded-[30px] px-[16px] pt-[12px] shadow-pal bg-white border border-gray-100 flex flex-col pb-4">
          <label className="relative block w-full flex-shrink-0">
            <span className="sr-only">Search country</span>
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              className="h-[40px] w-full rounded-full border border-gray-300 bg-gray-50 px-[23px] pr-[48px] text-[16px] text-black outline-none placeholder:text-gray-400"
              placeholder="Search here"
            />
            <Search className="absolute right-[20px] top-[9px] text-gray-400" size={22} />
          </label>
          <div className="mt-[16px] h-[250px] overflow-y-auto pb-[20px] pl-[6px] pr-[7px] scrollbar-hide text-black">
            {filtered.map(([flag, name]) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                className={cn(
                  "flex h-[43px] w-full items-center justify-between rounded-[8px] text-[15px] cursor-pointer px-3 transition-colors",
                  selected === name 
                    ? "bg-[var(--app-accent-soft)] font-bold" 
                    : "hover:bg-gray-100"
                )}
                style={{ textAlign: \'left\', color: selected === name ? \'var(--app-accent)\' : \'#1f2937\' }}
              >
                <div className="flex items-center gap-[20px]">
                  <span className="text-[29px] leading-none">{flag}</span>
                  <span>{name}</span>
                </div>
                {selected === name && <Check size={18} className="text-[var(--app-accent)]" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </section>
        <button 
          type="button" 
          onClick={onNext} 
          disabled={!selected}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}'''
code = code.replace(orig_country, new_country)

# LanguageScreen
orig_language = '''function LanguageScreen({
  selected,
  onSelect,
  onNext
}: {
  selected: string;
  onSelect: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="relative h-[calc(100%_-_58px)] px-[34px] pt-[8px] text-left">
      <h1 className="text-[36px] font-extrabold leading-[1.05]" style={{ color: \'var(--onb-heading)\' }}>
        Choose your language
      </h1>
      <p className="mt-[6px] max-w-[350px] text-[18px] font-medium leading-[1.25]" style={{ color: \'var(--onb-subtext)\' }}>
        Please choose your preferred Language from the list below.
      </p>
      <button
        type="button"
        className="mt-[26px] h-[54px] w-full rounded-[21px] px-[36px] text-[18px] cursor-default border shadow-sm font-semibold flex items-center justify-between"
        style={{ textAlign: \'left\', color: \'#111827\', backgroundColor: \'#ffffff\', borderColor: \'#d1d5db\' }}
      >
        <span>{selected || "Select Language"}</span>
        <ChevronDown size={20} className="text-gray-400" />
      </button>
      <section className="mt-[11px] h-[280px] overflow-hidden rounded-[30px] px-[20px] pt-[12px] shadow-pal bg-white border border-gray-100 text-black">
        <div className="h-full overflow-y-auto scrollbar-hide pb-4">
          {languages.map(([flag, name]) => (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(name)}
              className={cn(
                "flex h-[56px] w-full items-center justify-between rounded-[10px] text-[16px] cursor-pointer px-3 transition-colors",
                selected === name 
                  ? "bg-[var(--app-accent-soft)] font-bold" 
                  : "hover:bg-gray-100"
              )}
              style={{ textAlign: \'left\', color: selected === name ? \'var(--app-accent)\' : \'#1f2937\' }}
            >
              <div className="flex items-center gap-[10px]">
                <span className="text-[24px] leading-none">{flag}</span>
                <span>{name}</span>
              </div>
              {selected === name && <Check size={18} className="text-[var(--app-accent)]" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </section>
      <button 
        type="button" 
        onClick={onNext} 
        disabled={!selected}
        className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}'''
new_language = '''function LanguageScreen({
  selected,
  onSelect,
  onNext
}: {
  selected: string;
  onSelect: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide px-[34px] pt-[8px]">
      <div className="min-h-[620px] w-full h-full relative flex flex-col text-left">
        <h1 className="text-[36px] font-extrabold leading-[1.05]" style={{ color: \'var(--onb-heading)\' }}>
          Choose your language
        </h1>
        <p className="mt-[6px] max-w-[350px] text-[18px] font-medium leading-[1.25]" style={{ color: \'var(--onb-subtext)\' }}>
          Please choose your preferred Language from the list below.
        </p>
        <button
          type="button"
          className="mt-[26px] h-[54px] w-full rounded-[21px] px-[36px] text-[18px] cursor-default border shadow-sm font-semibold flex items-center justify-between flex-shrink-0"
          style={{ textAlign: \'left\', color: \'#111827\', backgroundColor: \'#ffffff\', borderColor: \'#d1d5db\' }}
        >
          <span>{selected || "Select Language"}</span>
          <ChevronDown size={20} className="text-gray-400" />
        </button>
        <section className="mt-[11px] h-[280px] overflow-hidden rounded-[30px] px-[20px] pt-[12px] shadow-pal bg-white border border-gray-100 text-black flex flex-col pb-4">
          <div className="h-full overflow-y-auto scrollbar-hide pb-4">
            {languages.map(([flag, name]) => (
              <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                className={cn(
                  "flex h-[56px] w-full items-center justify-between rounded-[10px] text-[16px] cursor-pointer px-3 transition-colors",
                  selected === name 
                    ? "bg-[var(--app-accent-soft)] font-bold" 
                    : "hover:bg-gray-100"
                )}
                style={{ textAlign: \'left\', color: selected === name ? \'var(--app-accent)\' : \'#1f2937\' }}
              >
                <div className="flex items-center gap-[10px]">
                  <span className="text-[24px] leading-none">{flag}</span>
                  <span>{name}</span>
                </div>
                {selected === name && <Check size={18} className="text-[var(--app-accent)]" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </section>
        <button 
          type="button" 
          onClick={onNext} 
          disabled={!selected}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] w-[calc(100%_-_68px)] cursor-pointer disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}'''
code = code.replace(orig_language, new_language)

# OtpScreen
orig_otp_screen = '''function OtpScreen({ email, onNext }: { email: string; onNext: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const keyboardVisible = true; // Always visible for a mobile app mockup

  const pressDigit = (digit: string) => {
    setError(false);
    setCode((value) => (value.length < 5 ? `${value}${digit}` : value));
  };

  const verify = async () => {
    if (code.length < 5) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const useSupabase = supabaseUrl && supabaseAnonKey && 
                        !supabaseUrl.includes("dummy-url") && 
                        !supabaseAnonKey.includes("dummy-key");

    if (useSupabase) {
      const { data, error: err } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup"
      });
      if (err) {
        setError(true);
        console.error("OTP verification error:", err.message);
      } else {
        // Sync local profile metadata
        try {
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: localStorage.getItem("pal_user_profile") ? JSON.parse(localStorage.getItem("pal_user_profile") || "{}").fullName : "New User",
              email
            })
          });
        } catch (e) {
          console.error("Sync profile error:", e);
        }
        setSuccess(true);
      }
    } else {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        });
        if (res.ok) {
          setSuccess(true);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Local verification error:", err);
        setError(true);
      }
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (success) return;
      if (e.key >= "0" && e.key <= "9") {
        setError(false);
        setCode((value) => (value.length < 5 ? `${value}${e.key}` : value));
      } else if (e.key === "Backspace") {
        setError(false);
        setCode((value) => value.slice(0, -1));
      } else if (e.key === "Enter") {
        if (code.length === 5) {
          verify();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, success]);

  const handleResendCode = () => {
    setCode("");
    setError(false);
    setTimeLeft(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, \'0\')}:${secs.toString().padStart(2, \'0\')}`;
  };

  return (
    <div className="relative h-[calc(100%_-_58px)] text-left">
      <section className="mx-[20px] mt-[32px] rounded-[30px] px-[26px] pb-[32px] pt-[31px] shadow-pal onb-white-card" style={{ color: \'var(--app-text)\' }}>
        <h1 className="text-[25px] font-extrabold" style={{ color: \'var(--onb-heading)\' }}>Enter code</h1>
        <p className="mt-[13px] text-[14px] leading-[1.2] text-[var(--app-text-secondary)]">
          We&apos;ve sent an email with an activation code
          <br />
          to your email <span className="text-[var(--app-text)] font-semibold">{email || "your email"}</span>
        </p>
        <div className="mt-[16px] flex justify-between gap-1 w-full">
          {[0, 1, 2, 3, 4].map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => pressDigit("1")}
              className={cn(
                "grid h-[60px] w-[50px] place-items-center rounded-[14px] border text-[24px] font-extrabold cursor-pointer transition-all duration-200 outline-none",
                error 
                  ? "border-[#ff3030] text-[#ff3030] bg-[#fff5f5]" 
                  : (index === code.length && !success)
                    ? "border-[var(--app-accent)] ring-2 ring-[var(--app-accent)]/20 bg-white shadow-md scale-105" 
                    : code[index] 
                      ? "border-gray-300 text-gray-900 bg-white font-bold" 
                      : "border-gray-200 text-gray-400 bg-gray-50/50"
              )}
            >
              {code[index] ?? ""}
            </button>
          ))}
        </div>
        {error && <p className="mt-[16px] text-center text-[12px] text-[#ff3030] font-bold">Wrong code, please try again</p>}
        <p className={cn("text-center text-[15px]", error ? "mt-[20px]" : "mt-[26px]")}>
          <button 
            type="button" 
            onClick={handleResendCode}
            disabled={timeLeft > 0}
            className={cn(
              "font-extrabold cursor-pointer",
              timeLeft > 0 
                ? "text-gray-400 cursor-not-allowed" 
                : "text-[var(--app-accent)] hover:underline"
            )}
            style={{ color: timeLeft > 0 ? \'#9ca3af\' : \'var(--app-accent)\' }}
          >
            Send code again
          </button>{" "}
          <span className="text-[var(--app-text-secondary)] font-mono font-semibold" style={{ color: \'#6b7280\' }}>
            {formatTime(timeLeft)}
          </span>
        </p>
      </section>

      <button
        type="button"
        onClick={verify}
        disabled={code.length < 5}
        className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] z-20 w-[calc(100%_-_68px)] cursor-pointer"
      >
        Verify
      </button>

      {/* Numerical Keyboard */}
      {keyboardVisible && (
        <NumberKeyboard 
          onDigit={pressDigit} 
          onBackspace={() => setCode((value) => value.slice(0, -1))} 
        />
      )}
      
      {/* Congrats Popup Modal */}
      {success && <SuccessModal onNext={onNext} />}
    </div>
  );
}'''
new_otp_screen = '''function OtpScreen({ email, onNext }: { email: string; onNext: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const keyboardVisible = true; // Always visible for a mobile app mockup

  const pressDigit = (digit: string) => {
    setError(false);
    setCode((value) => (value.length < 5 ? `${value}${digit}` : value));
  };

  const verify = async () => {
    if (code.length < 5) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const useSupabase = supabaseUrl && supabaseAnonKey && 
                        !supabaseUrl.includes("dummy-url") && 
                        !supabaseAnonKey.includes("dummy-key");

    if (useSupabase) {
      const { data, error: err } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup"
      });
      if (err) {
        setError(true);
        console.error("OTP verification error:", err.message);
      } else {
        // Sync local profile metadata
        try {
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: localStorage.getItem("pal_user_profile") ? JSON.parse(localStorage.getItem("pal_user_profile") || "{}").fullName : "New User",
              email
            })
          });
        } catch (e) {
          console.error("Sync profile error:", e);
        }
        setSuccess(true);
      }
    } else {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        });
        if (res.ok) {
          setSuccess(true);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Local verification error:", err);
        setError(true);
      }
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (success) return;
      if (e.key >= "0" && e.key <= "9") {
        setError(false);
        setCode((value) => (value.length < 5 ? `${value}${e.key}` : value));
      } else if (e.key === "Backspace") {
        setError(false);
        setCode((value) => value.slice(0, -1));
      } else if (e.key === "Enter") {
        if (code.length === 5) {
          verify();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, success]);

  const handleResendCode = () => {
    setCode("");
    setError(false);
    setTimeLeft(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, \'0\')}:${secs.toString().padStart(2, \'0\')}`;
  };

  return (
    <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide text-left">
      <div className="min-h-[640px] w-full h-full relative flex flex-col justify-between">
        <section className="mx-[20px] mt-[32px] rounded-[30px] px-[26px] pb-[32px] pt-[31px] shadow-pal onb-white-card" style={{ color: \'var(--app-text)\' }}>
          <h1 className="text-[25px] font-extrabold" style={{ color: \'var(--onb-heading)\' }}>Enter code</h1>
          <p className="mt-[13px] text-[14px] leading-[1.2] text-[var(--app-text-secondary)]">
            We&apos;ve sent an email with an activation code
            <br />
            to your email <span className="text-[var(--app-text)] font-semibold">{email || "your email"}</span>
          </p>
          <div className="mt-[16px] flex justify-between gap-1 w-full">
            {[0, 1, 2, 3, 4].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => pressDigit("1")}
                className={cn(
                  "grid h-[60px] w-[50px] place-items-center rounded-[14px] border text-[24px] font-extrabold cursor-pointer transition-all duration-200 outline-none",
                  error 
                    ? "border-[#ff3030] text-[#ff3030] bg-[#fff5f5]" 
                    : (index === code.length && !success)
                      ? "border-[var(--app-accent)] ring-2 ring-[var(--app-accent)]/20 bg-white shadow-md scale-105" 
                      : code[index] 
                        ? "border-gray-300 text-gray-900 bg-white font-bold" 
                        : "border-gray-200 text-gray-400 bg-gray-50/50"
                )}
              >
                {code[index] ?? ""}
              </button>
            ))}
          </div>
          {error && <p className="mt-[16px] text-center text-[12px] text-[#ff3030] font-bold">Wrong code, please try again</p>}
          <p className={cn("text-center text-[15px]", error ? "mt-[20px]" : "mt-[26px]")}>
            <button 
              type="button" 
              onClick={handleResendCode}
              disabled={timeLeft > 0}
              className={cn(
                "font-extrabold cursor-pointer",
                timeLeft > 0 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-[var(--app-accent)] hover:underline"
              )}
              style={{ color: timeLeft > 0 ? \'#9ca3af\' : \'var(--app-accent)\' }}
            >
              Send code again
            </button>{" "}
            <span className="text-[var(--app-text-secondary)] font-mono font-semibold" style={{ color: \'#6b7280\' }}>
              {formatTime(timeLeft)}
            </span>
          </p>
        </section>

        <button
          type="button"
          onClick={verify}
          disabled={code.length < 5}
          className="primary-pill absolute bottom-[39px] left-[34px] right-[34px] z-20 w-[calc(100%_-_68px)] cursor-pointer"
        >
          Verify
        </button>

        {/* Numerical Keyboard */}
        {keyboardVisible && (
          <NumberKeyboard 
            onDigit={pressDigit} 
            onBackspace={() => setCode((value) => value.slice(0, -1))} 
          />
        )}
        
        {/* Congrats Popup Modal */}
        {success && <SuccessModal onNext={onNext} />}
      </div>
    </div>
  );
}'''
code = code.replace(orig_otp_screen, new_otp_screen)

# 7. Update parent render method to use original routing and wrap auth screens
orig_parent_render = '''  return (
    <div className="phone-stage">
      <section className={cn("phone")} aria-label="PAL app">
        <StatusBar tone="dark" />
        {screen === "growth" && <GrowthIntro onNext={() => setScreen("manage")} />}
        {screen === "manage" && <ManageIntro onNext={() => setScreen("together")} />}
        {screen === "together" && <TogetherIntro onNext={() => setScreen("persona")} />}
        
        {screen === "persona" && (
          <PersonaScreen
            value={persona}
            onChange={setPersona}
            onNext={() => setScreen("industry")}
          />
        )}
        
        {screen === "industry" && (
          <IndustryScreen 
            value={industry} 
            onChange={setIndustry} 
            onNext={() => setScreen("country")} 
          />
        )}
        
        {screen === "country" && (
          <CountryScreen
            selected={country}
            query={searchCountry}
            onQuery={setSearchCountry}
            onSelect={setCountry}
            onNext={() => setScreen("language")}
          />
        )}
        
        {screen === "language" && (
          <LanguageScreen 
            selected={language} 
            onSelect={setLanguage} 
            onNext={() => setScreen("signup")} 
          />
        )}
        
        {screen === "signup" && (
          <SignupScreen 
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            persona={persona}
            industry={industry}
            country={country}
            language={language}
            onLogin={() => setScreen("login")} 
            onNext={() => setScreen("otp")} 
            onGoogle={() => handleSocialSignIn("google")}
            onBase={() => handleSocialSignIn("base")}
          />
        )}
        
        {screen === "login" && (
          <LoginScreen 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSignup={() => setScreen("signup")} 
            onNext={() => router.push("/")} 
            onGoogle={() => handleSocialSignIn("google")}
            onBase={() => handleSocialSignIn("base")}
          />
        )}
        
        {screen === "otp" && (
          <OtpScreen 
            email={email}
            onNext={() => router.push("/")} 
          />
        )}
      </section>
    </div>
  );'''
new_parent_render = '''  return (
    <div className="phone-stage">
      <section className={cn("phone")} aria-label="PAL app">
        <StatusBar tone="dark" />
        {screen === "growth" && <GrowthIntro onNext={() => setScreen("manage")} />}
        {screen === "manage" && <ManageIntro onNext={() => setScreen("together")} />}
        {screen === "together" && <TogetherIntro onNext={() => setScreen("persona")} />}
        
        {screen === "persona" && (
          <PersonaScreen
            value={persona}
            onChange={setPersona}
            onNext={() => setScreen("industry")}
          />
        )}
        
        {screen === "industry" && (
          <IndustryScreen 
            value={industry} 
            onChange={setIndustry} 
            onNext={() => setScreen("country")} 
          />
        )}
        
        {screen === "country" && (
          <CountryScreen
            selected={country}
            query={searchCountry}
            onQuery={setSearchCountry}
            onSelect={setCountry}
            onNext={() => setScreen("language")}
          />
        )}
        
        {screen === "language" && (
          <LanguageScreen 
            selected={language} 
            onSelect={setLanguage} 
            onNext={() => setScreen("signup")} 
          />
        )}
        
        {screen === "signup" && (
          <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide pb-10">
            <div className="min-h-[680px] w-full h-full relative">
              <SignupScreen 
                fullName={fullName}
                setFullName={setFullName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                persona={persona}
                industry={industry}
                country={country}
                language={language}
                onLogin={() => setScreen("login")} 
                onNext={() => setScreen("otp")} 
                onGoogle={() => handleSocialSignIn("google")}
                onBase={() => handleSocialSignIn("base")}
              />
            </div>
          </div>
        )}
        
        {screen === "login" && (
          <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide pb-10">
            <div className="min-h-[600px] w-full h-full relative">
              <LoginScreen 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onSignup={() => setScreen("signup")} 
                onNext={() => router.push("/")} 
                onGoogle={() => handleSocialSignIn("google")}
                onBase={() => handleSocialSignIn("base")}
              />
            </div>
          </div>
        )}
        
        {screen === "otp" && (
          <div className="relative h-[calc(100%_-_58px)] overflow-y-auto scrollbar-hide">
            <div className="min-h-[640px] w-full h-full relative">
              <OtpScreen 
                email={email}
                onNext={() => router.push("/")} 
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );'''
code = code.replace(orig_parent_render, new_parent_render)

with open('/Users/user/Documents/pal-frontend/components/OnboardingScreen.tsx', 'w') as f:
    f.write(code)

print("Process onboarding script ran successfully.")
