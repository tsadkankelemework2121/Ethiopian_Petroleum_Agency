import { Card, CardBody, CardHeader } from '../ui/Card'
import { SkeletonChart } from '../ui/Skeleton'

export default function FuelTypeSummary({
  deliveredSummary,
  isLoading,
  chartColors,
}: {
  deliveredSummary: { benzineM3: number; dieselM3: number; jetFuelM3: number }
  isLoading: boolean
  chartColors: { blue: string; gold: string; gray: string }
}) {
  const fuelData = [
    {
      name: 'Benzine',
      volume: deliveredSummary.benzineM3,
      color: chartColors.blue,
    },
    {
      name: 'Diesel',
      volume: deliveredSummary.dieselM3,
      color: chartColors.gold,
    },
    {
      name: 'Jet Fuel',
      volume: deliveredSummary.jetFuelM3,
      color: chartColors.gray,
    },
  ]
  const totalVolume = fuelData.reduce((sum, f) => sum + f.volume, 0)

  return (
    <div className="md:col-span-12 min-w-0">
      <Card>
        <CardHeader title="Fuel type dispatch summary" subtitle="Total dispatched volume by fuel type" />
        <CardBody className="h-auto py-5">
          {isLoading ? (
            <SkeletonChart className="h-full" />
          ) : (
            <div className="space-y-4">
              {fuelData.map((fuel) => {
                const percentage = totalVolume > 0 ? (fuel.volume / totalVolume) * 100 : 0
                return (
                  <div key={fuel.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text">{fuel.name}</span>
                      <span className="text-sm font-semibold text-text">
                        {fuel.volume.toLocaleString()}L
                        <span className="text-text-muted"> ({percentage.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-lg overflow-hidden border border-[#CBD5E1] bg-transparent">
                      <div
                        className="h-full transition-all duration-300 rounded-lg"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: fuel.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
              {/* Total dispatched liters */}
              <div className="mt-4 pt-4 border-t border-[#CBD5E1]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text">Total Dispatched</span>
                  <span className="text-lg font-bold text-primary">
                    {totalVolume.toLocaleString()} L
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
