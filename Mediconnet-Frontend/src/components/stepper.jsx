export function Stepper({ steps, currentStep }) {
    return (
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.id}
            </div>
            <div
              className={`ml-2 ${
                currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.name}
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-border mx-2" />
            )}
          </div>
        ))}
      </div>
    );
  }