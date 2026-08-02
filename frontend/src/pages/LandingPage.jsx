import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen grain">
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <span className="font-display font-bold text-xl text-evergreen">FoodShare</span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink/70 hover:text-evergreen">
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-evergreen text-paper px-4 py-2 rounded-sm hover:bg-evergreen-dark"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-10 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-evergreen mb-3">
            surplus food, routed before it spoils
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl leading-[1.1] text-ink mb-5">
            Every extra tray finds a table before the clock runs out.
          </h1>
          <p className="text-ink/70 text-lg mb-8 max-w-md">
            Kitchens and shops post what's left over. Shelters and neighbors nearby get an
            instant alert, claim it on a first-come basis, and pick it up before it expires.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="bg-tomato text-paper font-medium px-6 py-3 rounded-sm hover:bg-tomato-dark transition-colors"
            >
              Post surplus food
            </Link>
            <Link
              to="/register"
              className="border border-evergreen text-evergreen font-medium px-6 py-3 rounded-sm hover:bg-evergreen/10 transition-colors"
            >
              Find food nearby
            </Link>
          </div>
        </div>

        <div className="bg-ticket rounded-sm shadow-ticket p-5 rotate-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-ink/50">FS-LX92K-7QAM</span>
            <span className="stamp text-evergreen">Available</span>
          </div>
          <div className="ticket-seam mb-3" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-evergreen/70 mb-1">
            Cooked meal
          </p>
          <h3 className="font-display font-semibold text-xl mb-1">Vegetable biryani, 15 servings</h3>
          <p className="text-sm text-ink/70 mb-4">
            Catering surplus from tonight's event, packed in trays and still warm.
          </p>
          <div className="flex items-center justify-between text-sm border-t border-line/70 pt-3">
            <span className="font-mono text-ink/80">15 servings</span>
            <span className="font-mono text-tomato font-semibold">02:41:09 left</span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20 grid sm:grid-cols-3 gap-6">
        <div className="border-t-2 border-evergreen pt-4">
          <p className="font-display font-semibold text-lg mb-1">Nearby, in real time</p>
          <p className="text-sm text-ink/70">
            A new listing reaches every receiver within range the moment it's posted, no
            refreshing needed.
          </p>
        </div>
        <div className="border-t-2 border-tomato pt-4">
          <p className="font-display font-semibold text-lg mb-1">One claim, no conflicts</p>
          <p className="text-sm text-ink/70">
            The first receiver to claim a listing locks it. Everyone else sees it marked claimed
            instantly.
          </p>
        </div>
        <div className="border-t-2 border-mustard pt-4">
          <p className="font-display font-semibold text-lg mb-1">Built-in trust</p>
          <p className="text-sm text-ink/70">
            Every handoff ends in a rating, so reliable donors and receivers stand out over time.
          </p>
        </div>
      </section>
    </div>
  );
}
