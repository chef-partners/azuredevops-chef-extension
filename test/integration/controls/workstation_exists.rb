title 'Tests to confirm Chef Workstation has been installed'

control 'chef-workstation-exists' do
  impact 1.0
  title 'Ensure Chef Workstation exists'
  desc 'Verify that Chef workstation has been installed'

  # Set the path to the workstation dir based on the os.family
  if os.family == 'windows'
    install_path = 'C:/opscode/chef-worksation'
  else
    install_path = '/opt/chef-workstation'
  end

  describe directory(install_path) do
    it { should_exist }
  end
end