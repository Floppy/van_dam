require "rails_helper"

RSpec.describe LibraryScanJob, type: :job do
  before :all do
    ActiveJob::Base.queue_adapter = :test
  end

  let(:library) do
    create(:library, path: File.join(Rails.root, "spec", "fixtures", "library"))
  end

  it "generates a case-insensitive pattern for model files" do
    expect(LibraryScanJob.model_pattern).to eq "*.{stl,STL,obj,OBJ,3mf,3MF,blend,BLEND,mix,MIX,ply,PLY}"
  end

  it "can scan a library directory" do
    expect { LibraryScanJob.perform_now(library) }.to change { library.models.count }.to(3)
    expect(library.models.map(&:name)).to match_array ["Model One", "Model Two", "Thingiverse Model"]
    expect(library.models.map(&:path)).to match_array ["/model_one", "/subfolder/model_two", "/thingiverse_model"]
  end

  it "queues up model scans" do
    expect { LibraryScanJob.perform_now(library) }.to have_enqueued_job(ModelScanJob).exactly(3).times
  end

  it "removes models with no parts" do
    lib = create(:library, path: File.join("/", "tmp"))
    create(:model, library: lib, path: "missing")
    expect { LibraryScanJob.perform_now(lib) }.to change { lib.models.count }.from(1).to(0)
  end
end
