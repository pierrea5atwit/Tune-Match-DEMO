interface AnalysisItem {
  name: string;
  percentage: number;
}

interface MusicAnalysisProps {
  moods: AnalysisItem[];
  genres: AnalysisItem[];
}

export default function MusicAnalysis({ moods, genres }: MusicAnalysisProps) {
  const getMoodColor = (mood: string) => {
    const colors: { [key: string]: string } = {
      energetic: 'bg-red-500',
      chill: 'bg-blue-400',
      happy: 'bg-yellow-400',
      melancholic: 'bg-purple-500',
      danceable: 'bg-green-500',
    };
    return colors[mood] || 'bg-gray-500';
  };

  const getGenreColor = (index: number) => {
    const colors = [
      'bg-pink-500',
      'bg-orange-500',
      'bg-cyan-500',
      'bg-indigo-500',
      'bg-emerald-500',
    ];
    return colors[index] || 'bg-gray-500';
  };

  return (
    <div className="col-span-full bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold mb-6 text-gray-100">Your Music Analysis</h2>
      
      <div className="space-y-8">
        {/* Moods Section */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-200">Mood Distribution</h3>
          <div className="space-y-3">
            {moods.map((mood) => (
              <div key={mood.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 capitalize">{mood.name}</span>
                  <span className="text-gray-400">{mood.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getMoodColor(mood.name)} transition-all duration-500`}
                    style={{ width: `${mood.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genres Section */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-200">Top Genres</h3>
          <div className="space-y-3">
            {genres.map((genre, index) => (
              <div key={genre.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 capitalize">{genre.name}</span>
                  <span className="text-gray-400">{genre.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getGenreColor(index)} transition-all duration-500`}
                    style={{ width: `${genre.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 