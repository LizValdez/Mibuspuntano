using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Mibuspuntano.Startup))]
namespace Mibuspuntano
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
